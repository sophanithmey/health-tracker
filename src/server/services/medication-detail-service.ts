// ============================================================================
// Medication Detail Service
// Aggregates standardized ingredients, strengths, dosage forms, and brand/generic links.
// ============================================================================

import { RxNormDrugDetail } from '@/types/medication-database';
import { RxNormClient } from '../clients/rxnorm-client';
import { CURATED_DIABETES_CATALOG, MedicationSearchService } from './medication-search-service';

export class MedicationDetailService {
  /**
   * Retrieve normalized drug details by RxCUI or fuzzy name
   */
  public static async getDetailByRxcui(rxcuiOrName: string): Promise<RxNormDrugDetail | null> {
    const cleanId = decodeURIComponent(rxcuiOrName).trim();
    if (!cleanId) return null;

    const isNumeric = /^[0-9]+$/.test(cleanId);

    // 1. If numeric, attempt official RxNorm lookup
    if (isNumeric) {
      try {
        const detail = await RxNormClient.getAllRelated(cleanId);
        if (detail) return detail;

        // Fallback: Attempt properties-only lookup
        const props = await RxNormClient.getProperties(cleanId);
        if (props) {
          return {
            rxcui: cleanId,
            name: props.name || `RxCUI ${cleanId}`,
            genericName: props.name || 'Prescription Drug',
            activeIngredients: [props.name || 'Active component'],
            availableStrengths: [],
            dosageForms: ['Oral Form'],
            termType: props.tty || 'SCD',
            relatedConcepts: {},
            dataSource: 'RxNorm',
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn(`[MedicationDetailService] Failed to fetch RxCUI ${cleanId}:`, err);
      }
    }

    // 2. Check Curated Diabetes Catalog (handles RxCUI, brand/generic names, and aliases like Domicron & Gsiptin)
    const lower = cleanId.toLowerCase();
    const curated = CURATED_DIABETES_CATALOG.find((c) => {
      if (c.rxcui === cleanId || c.id === cleanId) return true;
      if (lower.includes('domicron') && (c.genericName || '').toLowerCase().includes('gliclazide')) return true;
      if (lower.includes('gsiptin') && c.name.toLowerCase().includes('sitagliptin')) return true;
      if (c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())) return true;
      if (c.genericName && (c.genericName.toLowerCase().includes(lower) || lower.includes(c.genericName.toLowerCase()))) return true;
      if (c.brandName && (c.brandName.toLowerCase().includes(lower) || lower.includes(c.brandName.toLowerCase()))) return true;
      return false;
    });

    if (curated) {
      return {
        rxcui: curated.rxcui,
        name: curated.name,
        genericName: curated.genericName || curated.name,
        brandName: curated.brandName,
        activeIngredients: curated.activeIngredients || [curated.genericName || curated.name],
        availableStrengths: curated.strengths || [],
        dosageForms: curated.dosageForms || ['Oral Tablet'],
        termType: curated.tty || 'SBD',
        relatedConcepts: {
          brands: curated.brandName ? [{ rxcui: curated.rxcui, name: curated.brandName }] : [],
          generics: curated.genericName ? [{ rxcui: curated.rxcui, name: curated.genericName }] : []
        },
        dataSource: 'RxNorm',
        lastUpdated: new Date().toISOString()
      };
    }

    // 3. Fallback search for non-numeric names
    if (!isNumeric) {
      try {
        const searchRes = await MedicationSearchService.search(cleanId, 1);
        if (searchRes.items && searchRes.items.length > 0) {
          const top = searchRes.items[0];
          return this.getDetailByRxcui(top.rxcui);
        }
      } catch (searchErr) {
        console.warn(`[MedicationDetailService] Search fallback failed for "${cleanId}":`, searchErr);
      }
    }

    return null;
  }
}

