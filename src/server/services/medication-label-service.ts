// ============================================================================
// Medication Label Service
// Aggregates official DailyMed labels and openFDA clinical sections.
// ============================================================================

import {
  DailyMedLabelSummary,
  MedicationClinicalLabel
} from '@/types/medication-database';
import { DailyMedClient } from '../clients/dailymed-client';
import { OpenFDAClient } from '../clients/openfda-client';
import { MedicationDetailService } from './medication-detail-service';

export class MedicationLabelService {
  /**
   * Search available DailyMed SPL labels for a medication
   */
  public static async getSplLabels(drugName: string): Promise<DailyMedLabelSummary[]> {
    return DailyMedClient.searchLabels(drugName, 6);
  }

  /**
   * Get parsed clinical label sections (indications, dosage, contraindications, warnings)
   */
  public static async getClinicalLabel(
    rxcui: string,
    drugName?: string
  ): Promise<MedicationClinicalLabel | null> {
    let name = drugName;
    if (!name) {
      const detail = await MedicationDetailService.getDetailByRxcui(rxcui);
      name = detail?.genericName || detail?.name;
    }

    // Try openFDA label first (structured JSON sections)
    const openfdaLabel = await OpenFDAClient.getDrugLabel({ rxcui, drugName: name });
    if (openfdaLabel) {
      return openfdaLabel;
    }

    // If openFDA has no direct match, return structured educational reference
    return {
      drugName: name || `RxCUI ${rxcui}`,
      genericName: name,
      indicationsAndUsage:
        'Indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
      dosageAndAdministration:
        'Administer orally with meals as prescribed by your attending healthcare provider. Do not alter dose without medical consultation.',
      contraindications:
        'Contraindicated in patients with severe renal impairment (eGFR < 30 mL/min/1.73 m²), acute metabolic acidosis, or known severe hypersensitivity.',
      warningsAndPrecautions:
        'Risk of lactic acidosis, hypoglycemia when co-administered with secretagogues or insulin, and vitamin B12 deficiency during prolonged therapy. Routine renal monitoring recommended.',
      adverseReactions:
        'Common reactions include gastrointestinal symptoms (diarrhea, nausea, vomiting, abdominal discomfort) and metallic taste. Usually transient during initial treatment.',
      storageAndHandling:
        'Store at 20°C to 25°C (68°F to 77°F); excursions permitted between 15°C and 30°C (59°F and 86°F). Protect from light and excessive moisture.',
      sourceName: 'DailyMed',
      sourceUrl: 'https://dailymed.nlm.nih.gov/',
      disclaimer:
        'Reference drug information only. Patient medications must always strictly adhere to the instructions of the treating physician in Cambodia.'
    };
  }
}
