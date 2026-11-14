// ============================================================================
// DailyMed API Client (Server-side Only)
// Official Documentation: https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm
// Base URL: https://dailymed.nlm.nih.gov/dailymed/services/v2/
// ============================================================================

import { DailyMedLabelSummary } from '@/types/medication-database';

const DAILYMED_BASE = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';
const REQUEST_TIMEOUT_MS = 8000;

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const splCache = new Map<string, CacheEntry<DailyMedLabelSummary[]>>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class DailyMedClient {
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
        console.warn(`[DailyMed] HTTP ${response.status} from ${url}`);
        return null;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[DailyMed] Request failed: ${url}`, err.message);
      return null;
    }
  }

  /**
   * Search official Structured Product Labels (SPLs) by drug name
   */
  public static async searchLabels(drugName: string, pageSize = 5): Promise<DailyMedLabelSummary[]> {
    const query = drugName.trim().toLowerCase();
    if (!query) return [];

    const cached = splCache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const endpoint = `${DAILYMED_BASE}/spls.json?drug_name=${encodeURIComponent(
      query
    )}&pagesize=${pageSize}`;

    const json: any = await this.fetchJson(endpoint);
    const dataItems = json?.data;

    if (!Array.isArray(dataItems)) {
      return [];
    }

    const labels: DailyMedLabelSummary[] = dataItems.map((item: any) => ({
      setId: item.setid,
      title: item.title || 'Official Package Insert',
      publishedDate: item.published_date || 'Unknown',
      version: Number(item.spl_version) || 1,
      sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${item.setid}`,
      jurisdiction: 'United States (FDA)'
    }));

    splCache.set(query, { timestamp: Date.now(), data: labels });
    return labels;
  }
}
