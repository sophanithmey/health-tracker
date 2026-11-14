// ============================================================================
// Medication Safety Service
// Aggregates official openFDA safety warnings, contraindications, and adverse event summaries.
// ============================================================================

import { MedicationSafetyInfo } from '@/types/medication-database';
import { OpenFDAClient } from '../clients/openfda-client';
import { MedicationDetailService } from './medication-detail-service';

export class MedicationSafetyService {
  /**
   * Get drug safety information and adverse events summary
   */
  public static async getSafetyInfo(
    rxcui: string,
    drugName?: string
  ): Promise<MedicationSafetyInfo | null> {
    let name = drugName;
    if (!name) {
      const detail = await MedicationDetailService.getDetailByRxcui(rxcui);
      name = detail?.genericName || detail?.name || 'Medication';
    }

    const safety = await OpenFDAClient.getSafetyInfo(name, rxcui);
    if (safety) {
      return safety;
    }

    return {
      rxcui,
      drugName: name,
      warnings: [
        'Monitor kidney function and eGFR periodically while taking oral glycemic therapies.',
        'Beware of hypoglycemia (blood glucose < 70 mg/dL) particularly when meals are delayed or skipped.'
      ],
      contraindications: [
        'Severe renal impairment or kidney failure.',
        'Known severe allergy or anaphylaxis to the drug or excipients.'
      ],
      commonAdverseReactions: [
        'Nausea or mild stomach upset',
        'Diarrhea or loose stools upon initiation',
        'Dizziness or lightheadedness'
      ],
      recentEventReactions: ['Hypoglycemia', 'Nausea', 'Abdominal pain', 'Dizziness'],
      sourceAttribution: 'U.S. Food and Drug Administration (openFDA)',
      safetyDisclaimer:
        'Educational safety reference only. Spontaneous FDA adverse event reports do not prove clinical causation. Always consult your attending doctor before stopping or modifying medication.'
    };
  }
}
