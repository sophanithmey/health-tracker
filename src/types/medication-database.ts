// ============================================================================
// Medication Information & Drug Database Types
// Standardized data models for RxNorm, DailyMed, and openFDA integrations.
// ============================================================================

export interface RxNormDrugConcept {
  id: string; // Internal unique ID or RxCUI
  rxcui: string;
  name: string;
  genericName?: string;
  brandName?: string;
  activeIngredients?: string[];
  strengths?: string[];
  dosageForms?: string[];
  tty?: string; // Term Type: SCD (Semantic Clinical Drug), SBD (Semantic Branded Drug), IN (Ingredient), etc.
  synonym?: string;
  source: 'RxNorm';
}

export interface RxNormSearchResult {
  query: string;
  total: number;
  items: RxNormDrugConcept[];
}

export interface RxNormDrugDetail {
  rxcui: string;
  name: string;
  genericName: string;
  brandName?: string;
  activeIngredients: string[];
  preciseIngredients?: string[];
  availableStrengths: string[];
  dosageForms: string[];
  termType: string;
  relatedConcepts: {
    brands?: Array<{ rxcui: string; name: string }>;
    generics?: Array<{ rxcui: string; name: string }>;
    doseForms?: Array<{ rxcui: string; name: string }>;
  };
  dataSource: 'RxNorm';
  lastUpdated?: string;
}

export interface DailyMedLabelSummary {
  setId: string;
  title: string;
  publishedDate: string;
  version: number;
  sourceUrl: string;
  jurisdiction: 'United States (FDA)';
}

export interface MedicationClinicalLabel {
  setId?: string;
  drugName: string;
  genericName?: string;
  brandName?: string;
  indicationsAndUsage?: string;
  dosageAndAdministration?: string;
  contraindications?: string;
  warningsAndPrecautions?: string;
  boxedWarning?: string;
  adverseReactions?: string;
  storageAndHandling?: string;
  sourceUrl?: string;
  sourceName: 'DailyMed' | 'openFDA';
  publishedDate?: string;
  disclaimer: string;
}

export interface OpenFDAAdverseEventReport {
  reaction: string;
  count?: number;
  outcome?: string;
}

export interface MedicationSafetyInfo {
  rxcui: string;
  drugName: string;
  boxedWarning?: string;
  warnings: string[];
  contraindications: string[];
  commonAdverseReactions: string[];
  recentEventReactions: string[];
  totalReportedEvents?: number;
  sourceAttribution: 'U.S. Food and Drug Administration (openFDA)';
  safetyDisclaimer: string;
}

export interface EnrichedMedicationReference {
  concept: RxNormDrugDetail;
  label?: MedicationClinicalLabel;
  safety?: MedicationSafetyInfo;
  availableSplLabels?: DailyMedLabelSummary[];
}
