// ============================================================================
// Medication Search Service
// Fast, normalized search across generic, brand, and ingredient concepts.
// ============================================================================

import { RxNormDrugConcept } from '@/types/medication-database';
import { RxNormClient } from '../clients/rxnorm-client';

// Curated fallbacks for reliable diabetic search even during external provider latency
export const CURATED_DIABETES_CATALOG: RxNormDrugConcept[] = [
  {
    id: '860975',
    rxcui: '860975',
    name: 'Metformin Hydrochloride 500 MG Extended Release Oral Tablet',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage XR',
    activeIngredients: ['Metformin Hydrochloride'],
    strengths: ['500 mg', '850 mg', '1000 mg'],
    dosageForms: ['Oral Tablet', 'Extended Release Oral Tablet'],
    tty: 'SCD',
    source: 'RxNorm'
  },
  {
    id: '4715',
    rxcui: '4715',
    name: 'Gliclazide 30 MG Modified Release Oral Tablet [Diamicron MR / Domicron]',
    genericName: 'Gliclazide',
    brandName: 'Diamicron / Domicron',
    activeIngredients: ['Gliclazide'],
    strengths: ['30 mg', '60 mg', '80 mg'],
    dosageForms: ['Modified Release Oral Tablet', 'Oral Tablet'],
    tty: 'SBD',
    source: 'RxNorm'
  },
  {
    id: '433856',
    rxcui: '433856',
    name: '24 HR Gliclazide 30 MG Extended Release Oral Tablet [Diamicron / Domicron]',
    genericName: 'Gliclazide',
    brandName: 'Diamicron / Domicron',
    activeIngredients: ['Gliclazide'],
    strengths: ['30 mg', '60 mg'],
    dosageForms: ['Extended Release Oral Tablet'],
    tty: 'SCD',
    source: 'RxNorm'
  },
  {
    id: '861771',
    rxcui: '861771',
    name: 'Metformin Hydrochloride 1000 MG / Sitagliptin 50 MG Oral Tablet [Janumet / Gsiptin-M]',
    genericName: 'Sitagliptin Phosphate and Metformin Hydrochloride',
    brandName: 'Janumet / Gsiptin-M',
    activeIngredients: ['Sitagliptin Phosphate', 'Metformin Hydrochloride'],
    strengths: ['50 mg / 500 mg', '50 mg / 1000 mg', '100 mg / 1000 mg'],
    dosageForms: ['Oral Tablet', 'Film Coated Oral Tablet'],
    tty: 'SBD',
    source: 'RxNorm'
  },
  {
    id: '593411',
    rxcui: '593411',
    name: 'Sitagliptin 100 MG Oral Tablet [Januvia]',
    genericName: 'Sitagliptin',
    brandName: 'Januvia',
    activeIngredients: ['Sitagliptin Phosphate'],
    strengths: ['25 mg', '50 mg', '100 mg'],
    dosageForms: ['Film Coated Oral Tablet'],
    tty: 'SBD',
    source: 'RxNorm'
  },
  {
    id: '4821',
    rxcui: '4821',
    name: 'Glimepiride 2 MG Oral Tablet [Amaryl]',
    genericName: 'Glimepiride',
    brandName: 'Amaryl',
    activeIngredients: ['Glimepiride'],
    strengths: ['1 mg', '2 mg', '3 mg', '4 mg'],
    dosageForms: ['Oral Tablet'],
    tty: 'SBD',
    source: 'RxNorm'
  },
  {
    id: '1545653',
    rxcui: '1545653',
    name: 'Empagliflozin 10 MG Oral Tablet [Jardiance]',
    genericName: 'Empagliflozin',
    brandName: 'Jardiance',
    activeIngredients: ['Empagliflozin'],
    strengths: ['10 mg', '25 mg'],
    dosageForms: ['Oral Tablet'],
    tty: 'SBD',
    source: 'RxNorm'
  },
  {
    id: '847207',
    rxcui: '847207',
    name: 'Human Insulin 100 UNT/ML Injectable Solution [Humulin R]',
    genericName: 'Insulin Regular (Human)',
    brandName: 'Humulin R',
    activeIngredients: ['Human Insulin'],
    strengths: ['100 units/mL'],
    dosageForms: ['Injectable Solution', 'Subcutaneous Pen'],
    tty: 'SBD',
    source: 'RxNorm'
  }
];

export class MedicationSearchService {
  /**
   * Search medications with RxNorm API with fallback to curated diabetes catalog
   */
  public static async search(query: string, limit = 20): Promise<{ query: string; total: number; items: RxNormDrugConcept[] }> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return { query: '', total: 0, items: [] };
    }

    try {
      const rxnormResults = await RxNormClient.searchDrugs(cleanQuery, limit);

      if (rxnormResults && rxnormResults.length > 0) {
        return {
          query: cleanQuery,
          total: rxnormResults.length,
          items: rxnormResults
        };
      }
    } catch (err) {
      console.warn('[MedicationSearchService] RxNorm query failed, trying curated catalog:', err);
    }

    // Match against curated list
    const matched = CURATED_DIABETES_CATALOG.filter(
      (m) =>
        m.name.toLowerCase().includes(cleanQuery) ||
        m.genericName?.toLowerCase().includes(cleanQuery) ||
        m.brandName?.toLowerCase().includes(cleanQuery) ||
        m.activeIngredients?.some((ing) => ing.toLowerCase().includes(cleanQuery))
    );

    return {
      query: cleanQuery,
      total: matched.length,
      items: matched.slice(0, limit)
    };
  }

  /**
   * Get common quick search suggestions
   */
  public static getPopularSuggestions(): Array<{ query: string; labelEn: string; labelKm: string }> {
    return [
      { query: 'metformin', labelEn: 'Metformin', labelKm: 'មេតហ្វ័រមីន (Metformin)' },
      { query: 'gliclazide', labelEn: 'Gliclazide', labelKm: 'គ្លីក្លាស៊ីត (Gliclazide)' },
      { query: 'sitagliptin', labelEn: 'Sitagliptin', labelKm: 'ស៊ីតាក្លីបទីន (Januvia)' },
      { query: 'glimepiride', labelEn: 'Glimepiride', labelKm: 'គ្លីមេភីរាយ (Amaryl)' },
      { query: 'insulin', labelEn: 'Insulin', labelKm: 'អាំងស៊ុយលីន (Insulin)' }
    ];
  }
}
