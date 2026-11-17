// ============================================================================
// Automated Test Suite: Diabetes Knowledge & Nutrition Module
// Runs with Node.js built-in test runner + jiti TS loader
// ============================================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const jiti = require('jiti')(__filename);

const { cleanXmlText, stripHtml, parseMedlineXml } = jiti('../src/server/services/medlinePlusService.ts');
const { normalizeUsdaFood } = jiti('../src/server/services/usdaFoodService.ts');
const { CURATED_ARTICLES, getCuratedArticles, searchHealthKnowledge } = jiti('../src/server/services/knowledgeService.ts');
const { DIABETES_RXNORM_MAP, DIABETES_CLINICAL_CODES } = jiti('../src/server/services/medlineConnectService.ts');
const { KnowledgeSearchSchema, NutritionSearchSchema, MedicationEducationQuerySchema } = jiti('../src/server/schemas/validation.ts');
const { getDiabeticFoodAdvice } = jiti('../src/lib/diabetic-food-advisor.ts');
const { CAMBODIAN_FOOD_GUIDE } = jiti('../src/data/cambodianFoodGuide.ts');

// ----------------------------------------------------------------------------
// 1. MedlinePlus Web Service & XML Parsing Tests
// ----------------------------------------------------------------------------

test('cleanXmlText correctly unescapes HTML entities and removes highlight tags', () => {
  const input = '&lt;span class="qt0"&gt;Diabetes&lt;/span&gt; &amp; Sugar &quot;Test&quot;&#39;s';
  const cleaned = cleanXmlText(input);
  assert.equal(cleaned, 'Diabetes & Sugar "Test"\'s');
});

test('stripHtml removes all HTML tags and collapses whitespace', () => {
  const html = '<p>What is <strong>diabetes</strong>?</p><ul><li>Type 1</li><li>Type 2</li></ul>';
  const stripped = stripHtml(html);
  assert.equal(stripped, 'What is diabetes? Type 1 Type 2');
});

test('parseMedlineXml safely parses MedlinePlus XML into normalized articles', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<nlmSearchResult>
  <term>diabetes</term>
  <count>1</count>
  <list num="1" start="0" per="1">
    <document rank="1" url="https://medlineplus.gov/diabetestype2.html">
      <content name="title">&lt;span class="qt0"&gt;Type 2 Diabetes&lt;/span&gt;</content>
      <content name="organizationName">National Library of Medicine</content>
      <content name="FullSummary">&lt;p&gt;Type 2 diabetes is a condition in which blood glucose is too high.&lt;/p&gt;</content>
      <content name="snippet">Type 2 diabetes overview...</content>
      <content name="mesh">Diabetes Mellitus, Type 2</content>
    </document>
  </list>
</nlmSearchResult>`;

  const articles = parseMedlineXml(sampleXml);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].title, 'Type 2 Diabetes');
  assert.equal(articles[0].sourceName, 'National Library of Medicine');
  assert.equal(articles[0].sourceUrl, 'https://medlineplus.gov/diabetestype2.html');
  assert.equal(articles[0].tags.includes('Diabetes Mellitus, Type 2'), true);
  assert.equal(articles[0].isCurated, false);
});

test('parseMedlineXml handles empty or malformed XML gracefully', () => {
  const emptyXml = '<nlmSearchResult><count>0</count></nlmSearchResult>';
  const results = parseMedlineXml(emptyXml);
  assert.deepEqual(results, []);
});

// ----------------------------------------------------------------------------
// 2. MedlinePlus Connect Clinical Codes Mapping Tests
// ----------------------------------------------------------------------------

test('DIABETES_RXNORM_MAP contains standard oral diabetes medications', () => {
  assert.equal(DIABETES_RXNORM_MAP.metformin.code, '860975');
  assert.equal(DIABETES_RXNORM_MAP.metformin.name, 'Metformin HCl');
  assert.ok(DIABETES_RXNORM_MAP.gliclazide.code);
  assert.ok(DIABETES_RXNORM_MAP.sitagliptin.code);
});

test('DIABETES_CLINICAL_CODES contains LOINC and ICD-10 identifiers', () => {
  assert.equal(DIABETES_CLINICAL_CODES.HBA1C.code, '4548-4'); // LOINC for HbA1c
  assert.equal(DIABETES_CLINICAL_CODES.TYPE_2_DIABETES.code, 'E11.9'); // ICD-10 for T2D
  assert.equal(DIABETES_CLINICAL_CODES.HYPOGLYCEMIA.code, 'E16.2');
});

// ----------------------------------------------------------------------------
// 3. USDA FoodData Central Normalization Tests
// ----------------------------------------------------------------------------

test('normalizeUsdaFood correctly extracts macronutrients and distinguishes carbs from sugars', () => {
  const mockRawFood = {
    fdcId: 123456,
    description: 'BROWN RICE, COOKED',
    brandOwner: 'Uncle Ben',
    servingSize: 50,
    servingSizeUnit: 'g',
    householdServingFullText: '0.25 cup',
    foodNutrients: [
      { nutrientId: 1008, nutrientName: 'Energy', value: 360 },
      { nutrientId: 1005, nutrientName: 'Carbohydrate, by difference', value: 76.5 },
      { nutrientId: 2000, nutrientName: 'Total Sugars', value: 0.5 },
      { nutrientId: 1079, nutrientName: 'Fiber, total dietary', value: 4.2 },
      { nutrientId: 1003, nutrientName: 'Protein', value: 8.0 },
      { nutrientId: 1004, nutrientName: 'Total lipid (fat)', value: 2.5 }
    ]
  };

  const normalized = normalizeUsdaFood(mockRawFood);

  // Per 100g assertions
  assert.equal(normalized.fdcId, 123456);
  assert.equal(normalized.description, 'BROWN RICE, COOKED');
  assert.equal(normalized.per100g.caloriesKcal, 360);
  assert.equal(normalized.per100g.carbohydratesG, 76.5);
  assert.equal(normalized.per100g.totalSugarsG, 0.5);
  assert.equal(normalized.per100g.dietaryFiberG, 4.2);
  assert.equal(normalized.per100g.proteinG, 8.0);
  assert.equal(normalized.per100g.totalFatG, 2.5);

  // Distinction: carbs must not be equal to sugars
  assert.notEqual(normalized.per100g.carbohydratesG, normalized.per100g.totalSugarsG);

  // Per serving calculation (50g = 50% of 100g)
  assert.ok(normalized.perServing);
  assert.equal(normalized.perServing.caloriesKcal, 180);
  assert.equal(normalized.perServing.carbohydratesG, 38.3);
  assert.equal(normalized.perServing.totalSugarsG, 0.3);
});

test('normalizeUsdaFood handles missing nutrition values without assuming zero', () => {
  const mockIncompleteFood = {
    fdcId: 999999,
    description: 'SPECIALTY FOOD',
    foodNutrients: [
      { nutrientId: 1008, nutrientName: 'Energy', value: 250 }
      // Carbs, sugars, fiber omitted
    ]
  };

  const normalized = normalizeUsdaFood(mockIncompleteFood);
  assert.equal(normalized.per100g.caloriesKcal, 250);
  assert.equal(normalized.per100g.carbohydratesG, undefined);
  assert.equal(normalized.per100g.totalSugarsG, undefined);
  assert.equal(normalized.per100g.dietaryFiberG, undefined);
});

// ----------------------------------------------------------------------------
// 4. Curated Articles & Knowledge Service Tests
// ----------------------------------------------------------------------------

test('CURATED_ARTICLES covers all required diabetes educational categories', () => {
  const categories = new Set(CURATED_ARTICLES.map((a) => a.category));
  assert.ok(categories.has('understanding'));
  assert.ok(categories.has('testing_guide'));
  assert.ok(categories.has('glucose_hba1c'));
  assert.ok(categories.has('hypo_hyper'));
  assert.ok(categories.has('medications'));
  assert.ok(categories.has('nutrition'));
});

test('getCuratedArticles filters correctly by category', () => {
  const testingArticles = getCuratedArticles('testing_guide');
  assert.ok(testingArticles.length > 0);
  assert.ok(testingArticles.every((a) => a.category === 'testing_guide'));
});

test('CURATED_ARTICLES has complete bilingual translations', () => {
  for (const article of CURATED_ARTICLES) {
    assert.ok(article.title && article.title.length > 0);
    assert.ok(article.titleKm && article.titleKm.length > 0);
    assert.ok(article.summary && article.summary.length > 0);
    assert.ok(article.summaryKm && article.summaryKm.length > 0);
    assert.ok(article.sourceName && article.sourceUrl);
  }
});

// ----------------------------------------------------------------------------
// 5. Zod Request Validation Schemas
// ----------------------------------------------------------------------------

test('KnowledgeSearchSchema validates query parameters correctly', () => {
  const valid = KnowledgeSearchSchema.parse({ q: 'hba1c', category: 'glucose_hba1c' });
  assert.equal(valid.q, 'hba1c');
  assert.equal(valid.category, 'glucose_hba1c');

  // Default fallback
  const empty = KnowledgeSearchSchema.parse({});
  assert.equal(empty.q, 'diabetes');
});

test('NutritionSearchSchema rejects empty query string', () => {
  assert.throws(() => {
    NutritionSearchSchema.parse({ q: '' });
  });
});

test('NutritionSearchSchema enforces positive page size limit', () => {
  const valid = NutritionSearchSchema.parse({ q: 'rice', pageSize: '15' });
  assert.equal(valid.pageSize, 15);

  assert.throws(() => {
    NutritionSearchSchema.parse({ q: 'rice', pageSize: 0 });
  });
});

// ----------------------------------------------------------------------------
// 6. Clinical Diabetic Food Advisor & Portion Rules Tests
// ----------------------------------------------------------------------------

test('getDiabeticFoodAdvice classifies non-starchy vegetables as eat_freely', () => {
  const morningGloryFood = {
    fdcId: 111,
    description: 'WATER SPINACH, MORNING GLORY, RAW',
    per100g: {
      caloriesKcal: 19,
      carbohydratesG: 3.1,
      totalSugarsG: 0.4,
      dietaryFiberG: 2.1,
      proteinG: 2.6,
      totalFatG: 0.2
    }
  };

  const advice = getDiabeticFoodAdvice(morningGloryFood);
  assert.equal(advice.verdict, 'eat_freely');
  assert.equal(advice.plateCategory, 'vegetables');
  assert.ok(advice.portionGuideEn.includes('half of Mom'));
  assert.ok(advice.howToEatEn.includes('FIRST'));
});

test('getDiabeticFoodAdvice classifies white rice as strict_limit with 1/2 cup max guidance', () => {
  const whiteRiceFood = {
    fdcId: 222,
    description: 'WHITE RICE, LONG GRAIN, ENRICHED',
    per100g: {
      caloriesKcal: 365,
      carbohydratesG: 80.0,
      totalSugarsG: 0.1,
      dietaryFiberG: 1.3,
      proteinG: 7.1,
      totalFatG: 0.7
    }
  };

  const advice = getDiabeticFoodAdvice(whiteRiceFood);
  assert.equal(advice.verdict, 'strict_limit');
  assert.equal(advice.plateCategory, 'caution');
  assert.ok(advice.portionGuideEn.includes('1/2 cup'));
  assert.ok(advice.howToEatEn.includes('Never eat high-carb grains on an empty stomach'));
  assert.ok(advice.healthierSwapEn && advice.healthierSwapEn.includes('brown rice'));
});

test('getDiabeticFoodAdvice classifies fresh fish as healthy protein', () => {
  const fishFood = {
    fdcId: 333,
    description: 'FISH, SALMON, ATLANTIC, WILD, RAW',
    per100g: {
      caloriesKcal: 142,
      carbohydratesG: 0,
      totalSugarsG: 0,
      dietaryFiberG: 0,
      proteinG: 19.8,
      totalFatG: 6.3
    }
  };

  const advice = getDiabeticFoodAdvice(fishFood);
  assert.equal(advice.verdict, 'eat_freely');
  assert.equal(advice.plateCategory, 'protein');
  assert.ok(advice.portionGuideEn.includes('Palm-sized'));
});

test('getDiabeticFoodAdvice classifies whole fruit as portion_control with 1 small fruit guidance', () => {
  const bananaFood = {
    fdcId: 444,
    description: 'BANANAS, RAW',
    per100g: {
      caloriesKcal: 89,
      carbohydratesG: 22.8,
      totalSugarsG: 12.2,
      dietaryFiberG: 2.6,
      proteinG: 1.1,
      totalFatG: 0.3
    }
  };

  const advice = getDiabeticFoodAdvice(bananaFood);
  assert.equal(advice.verdict, 'portion_control');
  assert.equal(advice.plateCategory, 'fruit');
  assert.ok(advice.portionGuideEn.includes('1 small banana'));
});

test('getDiabeticFoodAdvice classifies durian dynamically as strict_limit with seed/segment guidance', () => {
  const durianFood = {
    fdcId: 555,
    description: 'DURIAN, RAW OR FROZEN',
    per100g: {
      caloriesKcal: 147,
      carbohydratesG: 27.1,
      totalSugarsG: 12.0,
      dietaryFiberG: 3.8,
      proteinG: 1.5,
      totalFatG: 5.3
    }
  };

  const advice = getDiabeticFoodAdvice(durianFood);
  assert.equal(advice.verdict, 'strict_limit');
  assert.equal(advice.plateCategory, 'caution');
  assert.ok(advice.portionGuideEn.includes('1 small seed / segment'));
  assert.ok(!advice.portionGuideEn.includes('cup cooked'));
  assert.ok(advice.portionGuideKm.includes('១ កញ្ចង់តូច'));
});

// ----------------------------------------------------------------------------
// 7. Cambodian Food Guide & Cultural Nutrition Tests
// ----------------------------------------------------------------------------

test('CAMBODIAN_FOOD_GUIDE includes rich selection of iconic traditional meals', () => {
  assert.ok(CAMBODIAN_FOOD_GUIDE.length >= 12);
  const dishIds = new Set(CAMBODIAN_FOOD_GUIDE.map((d) => d.id));
  assert.ok(dishIds.has('samlor-korko'));
  assert.ok(dishIds.has('bai-sach-chrouk'));
  assert.ok(dishIds.has('num-banh-chok'));
  assert.ok(dishIds.has('amok-trey'));
  assert.ok(dishIds.has('samlor-machu-kroeung'));
  assert.ok(dishIds.has('kuy-teav'));
  assert.ok(dishIds.has('lok-lak'));
  assert.ok(dishIds.has('chhar-knyei'));
  assert.ok(dishIds.has('samlor-prohir'));
  assert.ok(dishIds.has('nom-krouk'));
});

test('CAMBODIAN_FOOD_GUIDE has complete bilingual data and clinical guidance', () => {
  for (const dish of CAMBODIAN_FOOD_GUIDE) {
    assert.ok(dish.id);
    assert.ok(dish.nameKm && dish.nameKm.length > 0);
    assert.ok(dish.nameEn && dish.nameEn.length > 0);
    assert.ok(dish.descriptionKm && dish.descriptionKm.length > 0);
    assert.ok(dish.descriptionEn && dish.descriptionEn.length > 0);
    assert.ok(['low', 'moderate', 'high'].includes(dish.carbLevel));
    assert.ok(dish.portionGuidanceKm && dish.portionGuidanceKm.length > 0);
    assert.ok(dish.portionGuidanceEn && dish.portionGuidanceEn.length > 0);
    assert.ok(dish.educationalTipKm && dish.educationalTipKm.length > 0);
    assert.ok(dish.educationalTipEn && dish.educationalTipEn.length > 0);
    assert.ok(Array.isArray(dish.keyComponents.vegetables));
    assert.ok(Array.isArray(dish.keyComponents.protein));
    assert.ok(Array.isArray(dish.keyComponents.carbohydrates));
  }
});
