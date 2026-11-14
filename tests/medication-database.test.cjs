// ============================================================================
// Automated Test Suite: Medication Information & Drug Database Module
// Testing: RxNorm concept parsing, DailyMed & openFDA normalization,
//          safety warnings, search fallback catalog, validation schemas,
//          and Khmer/English localization parity.
// ============================================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const jiti = require('jiti')(__filename);

const {
  MedicationSearchSchema,
  RxCuiParamSchema,
  SetIdParamSchema,
  PatientMedicationWithRefSchema
} = jiti('../src/server/schemas/medication-validation.ts');

const {
  MedicationSearchService,
  CURATED_DIABETES_CATALOG
} = jiti('../src/server/services/medication-search-service.ts');

const {
  MedicationSafetyService
} = jiti('../src/server/services/medication-safety-service.ts');

const {
  MedicationDetailService
} = jiti('../src/server/services/medication-detail-service.ts');

// ----------------------------------------------------------------------------
// 1. Zod Validation Schemas
// ----------------------------------------------------------------------------

test('MedicationSearchSchema validates query parameters with default limit', () => {
  const result = MedicationSearchSchema.parse({ q: 'Metformin' });
  assert.equal(result.q, 'Metformin');
  assert.equal(result.limit, 20);
});

test('MedicationSearchSchema trims whitespace and supports custom limit', () => {
  const result = MedicationSearchSchema.parse({ q: '  glipizide  ', limit: '10' });
  assert.equal(result.q, 'glipizide');
  assert.equal(result.limit, 10);
});

test('MedicationSearchSchema rejects empty query string', () => {
  assert.throws(() => MedicationSearchSchema.parse({ q: '   ' }), {
    name: 'ZodError'
  });
});

test('RxCuiParamSchema validates concept or medication identifiers', () => {
  const validNum = RxCuiParamSchema.parse({ rxcui: '860975' });
  assert.equal(validNum.rxcui, '860975');

  const validName = RxCuiParamSchema.parse({ rxcui: 'Domicron' });
  assert.equal(validName.rxcui, 'Domicron');

  assert.throws(() => RxCuiParamSchema.parse({ rxcui: '' }), {
    name: 'ZodError'
  });
});

test('SetIdParamSchema validates non-empty string', () => {
  const valid = SetIdParamSchema.parse({ setId: 'b39d1b6b-4e89-4e78-bc4a-93be9533f524' });
  assert.equal(valid.setId, 'b39d1b6b-4e89-4e78-bc4a-93be9533f524');

  assert.throws(() => SetIdParamSchema.parse({ setId: ' ' }), {
    name: 'ZodError'
  });
});

test('PatientMedicationWithRefSchema accepts prescription with reference fields', () => {
  const prescription = {
    name: 'Metformin HCl 500mg ER',
    dosage: '500 mg',
    frequency: 'Once daily with dinner',
    startDate: '2026-11-14',
    isActive: true,
    rxcui: '860975',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage XR',
    activeIngredients: ['Metformin Hydrochloride'],
    dosageForm: 'Extended Release Oral Tablet',
    referenceSource: 'RxNorm'
  };

  const parsed = PatientMedicationWithRefSchema.parse(prescription);
  assert.equal(parsed.name, 'Metformin HCl 500mg ER');
  assert.equal(parsed.rxcui, '860975');
  assert.equal(parsed.genericName, 'Metformin Hydrochloride');
  assert.equal(parsed.brandName, 'Glucophage XR');
  assert.deepEqual(parsed.activeIngredients, ['Metformin Hydrochloride']);
  assert.equal(parsed.dosageForm, 'Extended Release Oral Tablet');
  assert.equal(parsed.referenceSource, 'RxNorm');
});

// ----------------------------------------------------------------------------
// 2. Curated Diabetes Catalog & Search
// ----------------------------------------------------------------------------

test('CURATED_DIABETES_CATALOG contains essential diabetic medications', () => {
  assert.ok(CURATED_DIABETES_CATALOG.length >= 5);
  
  const metformin = CURATED_DIABETES_CATALOG.find((m) => m.rxcui === '860975');
  assert.ok(metformin, 'Metformin should exist in catalog');
  assert.equal(metformin.genericName, 'Metformin Hydrochloride');
  assert.ok(metformin.strengths.includes('500 mg'));
  assert.ok(metformin.activeIngredients.includes('Metformin Hydrochloride'));

  const gliclazide = CURATED_DIABETES_CATALOG.find((m) => m.rxcui === '4715' || m.rxcui === '433856');
  assert.ok(gliclazide, 'Gliclazide should exist in catalog');
  assert.ok(gliclazide.brandName.includes('Diamicron'));

  const sitagliptin = CURATED_DIABETES_CATALOG.find((m) => m.rxcui === '593411');
  assert.ok(sitagliptin, 'Sitagliptin should exist in catalog');
  assert.equal(sitagliptin.brandName, 'Januvia');
});

test('MedicationSearchService.search returns matches from curated catalog', async () => {
  const results = await MedicationSearchService.search('metformin', 10);
  assert.ok(results && results.items && results.items.length > 0);
  const match = results.items.find((r) => r.rxcui === '860975' || r.name.toLowerCase().includes('metformin'));
  assert.ok(match, 'Search for metformin should return valid concept');
  assert.ok((match.genericName || match.name).toLowerCase().includes('metformin'));
});

test('MedicationSearchService.search matches brand names like Januvia', async () => {
  const results = await MedicationSearchService.search('Januvia', 5);
  assert.ok(results && results.items && results.items.length > 0);
  const match = results.items.find((r) => r.brandName?.toLowerCase().includes('januvia') || r.name.toLowerCase().includes('januvia'));
  assert.ok(match, 'Search for Januvia should resolve to Sitagliptin');
});

test('MedicationDetailService resolves Domicron to Gliclazide concept', async () => {
  const detail = await MedicationDetailService.getDetailByRxcui('Domicron');
  assert.ok(detail, 'Domicron should resolve to a valid drug concept');
  assert.ok(detail.name.toLowerCase().includes('gliclazide') || detail.genericName.toLowerCase().includes('gliclazide'));
  assert.ok(detail.rxcui === '433856' || detail.rxcui === '4715');
});

test('MedicationDetailService resolves Gsiptin -M 50mg/1000mg to Sitagliptin/Metformin concept', async () => {
  const detail = await MedicationDetailService.getDetailByRxcui('Gsiptin -M 50mg/1000mg');
  assert.ok(detail, 'Gsiptin -M should resolve to a valid drug concept');
  assert.equal(detail.rxcui, '861771');
  assert.ok(detail.activeIngredients.some((ing) => ing.toLowerCase().includes('sitagliptin')));
  assert.ok(detail.activeIngredients.some((ing) => ing.toLowerCase().includes('metformin')));
});

// ----------------------------------------------------------------------------
// 3. Safety Service & Medical Disclaimers
// ----------------------------------------------------------------------------

test('MedicationSafetyService returns standardized safety structure and required disclaimers', async () => {
  const safety = await MedicationSafetyService.getSafetyInfo('860975', 'Metformin');
  assert.ok(safety, 'Safety information should not be null');
  assert.equal(safety.rxcui, '860975');
  assert.ok(Array.isArray(safety.warnings));
  assert.ok(Array.isArray(safety.contraindications));
  assert.ok(Array.isArray(safety.commonAdverseReactions));

  // Verify non-causation legal & safety disclaimer
  const disclaimerLower = safety.safetyDisclaimer.toLowerCase();
  assert.ok(
    disclaimerLower.includes('causation'),
    'Disclaimer must explicitly state reports do not prove causation'
  );
  assert.ok(
    disclaimerLower.includes('doctor') || disclaimerLower.includes('clinical') || disclaimerLower.includes('consultation'),
    'Disclaimer must urge consulting physician'
  );
  assert.ok(safety.sourceAttribution.includes('Food and Drug Administration'));
});

// ----------------------------------------------------------------------------
// 4. Bilingual Localization (Khmer & English) Parity
// ----------------------------------------------------------------------------

test('Localization files contain all required medication database keys in EN and KM', () => {
  const enPath = path.resolve(__dirname, '../messages/en.json');
  const kmPath = path.resolve(__dirname, '../messages/km.json');

  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const km = JSON.parse(fs.readFileSync(kmPath, 'utf8'));

  const requiredKeys = [
    'medicationInformation',
    'searchMedication',
    'searchPlaceholder',
    'genericName',
    'brandName',
    'activeIngredients',
    'strength',
    'dosageForm',
    'usesAndIndications',
    'dosageAndAdministration',
    'contraindications',
    'warningsAndPrecautions',
    'sideEffects',
    'storageInformation',
    'source',
    'lastUpdated',
    'noMedicationFound',
    'safetyDisclaimer',
    'viewGuide',
    'addToPrescriptions'
  ];

  for (const key of requiredKeys) {
    assert.ok(en.medications[key], `Missing en.json key: medications.${key}`);
    assert.ok(km.medications[key], `Missing km.json key: medications.${key}`);
  }
});
