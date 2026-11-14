// ============================================================================
// Medication Detail Service
// Aggregates standardized ingredients, strengths, dosage forms, and brand/generic links.
// ============================================================================

import { RxNormDrugDetail } from '@/types/medication-database';
import { RxNormClient } from '../clients/rxnorm-client';

export class MedicationDetailService {
  /**
   * Retrieve normalized drug details by RxCUI
   */
  public static async getDetailByRxcui(rxcui: string): Promise<RxNormDrugDetail | null> {
    const cleanRxcui = rxcui.trim();
    if (!cleanRxcui) return null;

    try {
      const detail = await RxNormClient.getAllRelated(cleanRxcui);
      if (detail) return detail;

      // Fallback: Attempt properties-only lookup
      const props = await RxNormClient.getProperties(cleanRxcui);
      if (props) {
        return {
          rxcui: cleanRxcui,
          name: props.name || `RxCUI ${cleanRxcui}`,
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
      console.warn(`[MedicationDetailService] Failed to fetch RxCUI ${cleanRxcui}:`, err);
    }

    return null;
  }
}
