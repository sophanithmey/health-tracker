// ============================================================================
// RxNorm API Client (Server-side Only)
// Documentation: https://rxnav.nlm.nih.gov/
// Base URL: https://rxnav.nlm.nih.gov/REST/
// ============================================================================

import { RxNormDrugConcept, RxNormDrugDetail } from '@/types/medication-database';

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';
const REQUEST_TIMEOUT_MS = 8000;

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const searchCache = new Map<string, CacheEntry<RxNormDrugConcept[]>>();
const detailCache = new Map<string, CacheEntry<RxNormDrugDetail | null>>();

const SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 mins
const DETAIL_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class RxNormClient {
  /**
   * Safe fetch with timeout and standard JSON headers
   */
  private static async fetchJson<T>(url: string): Promise<T | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FamilyDiabetesCare/1.0 (Public Medication Database)'
        }
      });
      clearTimeout(timer);

      if (!response.ok) {
        console.warn(`[RxNorm] HTTP ${response.status} from ${url}`);
        return null;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[RxNorm] Request failed: ${url}`, err.message);
      return null;
    }
  }

  /**
   * Search drugs by exact or partial name
   */
  public static async searchDrugs(query: string, limit = 20): Promise<RxNormDrugConcept[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const cached = searchCache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
      return cached.data.slice(0, limit);
    }

    const resultsMap = new Map<string, RxNormDrugConcept>();

    // Strategy 1: /drugs.json?name={query}
    const drugsData: any = await this.fetchJson(
      `${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(normalizedQuery)}`
    );

    if (drugsData?.drugGroup?.conceptGroup) {
      for (const cg of drugsData.drugGroup.conceptGroup) {
        if (!cg.conceptProperties) continue;
        for (const prop of cg.conceptProperties) {
          if (!resultsMap.has(prop.rxcui)) {
            resultsMap.set(prop.rxcui, {
              id: prop.rxcui,
              rxcui: prop.rxcui,
              name: prop.name,
              synonym: prop.synonym || undefined,
              tty: prop.tty,
              source: 'RxNorm'
            });
          }
        }
      }
    }

    // Strategy 2: If few or no results, use approximateTerm.json
    if (resultsMap.size < 5) {
      const approxData: any = await this.fetchJson(
        `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(
          normalizedQuery
        )}&maxEntries=15`
      );

      const candidates = approxData?.approximateGroup?.candidate;
      if (Array.isArray(candidates)) {
        for (const cand of candidates) {
          if (cand.rxcui && !resultsMap.has(cand.rxcui)) {
            // Retrieve basic name for candidate if missing
            const name = cand.name || `${normalizedQuery} (RxCUI: ${cand.rxcui})`;
            resultsMap.set(cand.rxcui, {
              id: cand.rxcui,
              rxcui: cand.rxcui,
              name,
              source: 'RxNorm'
            });
          }
        }
      }
    }

    const results = Array.from(resultsMap.values());
    searchCache.set(normalizedQuery, { timestamp: Date.now(), data: results });
    return results.slice(0, limit);
  }

  /**
   * Get drug properties by RxCUI
   */
  public static async getProperties(rxcui: string): Promise<any | null> {
    const data: any = await this.fetchJson(`${RXNORM_BASE}/rxcui/${rxcui}/properties.json`);
    return data?.properties || null;
  }

  /**
   * Get all related concepts (ingredients, brands, strengths, dose forms)
   */
  public static async getAllRelated(rxcui: string): Promise<RxNormDrugDetail | null> {
    const cached = detailCache.get(rxcui);
    if (cached && Date.now() - cached.timestamp < DETAIL_CACHE_TTL) {
      return cached.data;
    }

    const [propData, relatedData]: [any, any] = await Promise.all([
      this.fetchJson(`${RXNORM_BASE}/rxcui/${rxcui}/properties.json`),
      this.fetchJson(`${RXNORM_BASE}/rxcui/${rxcui}/allrelated.json`)
    ]);

    const properties = propData?.properties;
    if (!properties && !relatedData?.allRelatedGroup) {
      return null;
    }

    const conceptGroups = relatedData?.allRelatedGroup?.conceptGroup || [];

    const activeIngredients: string[] = [];
    const preciseIngredients: string[] = [];
    const availableStrengths: string[] = [];
    const dosageForms: string[] = [];
    const brands: Array<{ rxcui: string; name: string }> = [];
    const generics: Array<{ rxcui: string; name: string }> = [];
    const doseForms: Array<{ rxcui: string; name: string }> = [];

    for (const group of conceptGroups) {
      const tty = group.tty;
      const props = group.conceptProperties || [];

      for (const p of props) {
        if (tty === 'IN' && !activeIngredients.includes(p.name)) {
          activeIngredients.push(p.name);
        } else if (tty === 'PIN' && !preciseIngredients.includes(p.name)) {
          preciseIngredients.push(p.name);
        } else if (tty === 'BN') {
          brands.push({ rxcui: p.rxcui, name: p.name });
        } else if (tty === 'DF' && !dosageForms.includes(p.name)) {
          dosageForms.push(p.name);
          doseForms.push({ rxcui: p.rxcui, name: p.name });
        } else if (tty === 'SCDC' || tty === 'SCD') {
          // Extract strength component
          if (p.name && !availableStrengths.includes(p.name)) {
            availableStrengths.push(p.name);
          }
          generics.push({ rxcui: p.rxcui, name: p.name });
        }
      }
    }

    const detail: RxNormDrugDetail = {
      rxcui,
      name: properties?.name || activeIngredients[0] || `RxCUI ${rxcui}`,
      genericName: activeIngredients[0] || properties?.name || 'Unknown',
      brandName: brands[0]?.name,
      activeIngredients: activeIngredients.length > 0 ? activeIngredients : [properties?.name || 'Active component'],
      preciseIngredients,
      availableStrengths: availableStrengths.slice(0, 10),
      dosageForms: dosageForms.length > 0 ? dosageForms : ['Oral Tablet / Capsule'],
      termType: properties?.tty || 'SCD',
      relatedConcepts: {
        brands: brands.slice(0, 10),
        generics: generics.slice(0, 10),
        doseForms: doseForms.slice(0, 10)
      },
      dataSource: 'RxNorm',
      lastUpdated: new Date().toISOString()
    };

    detailCache.set(rxcui, { timestamp: Date.now(), data: detail });
    return detail;
  }
}
