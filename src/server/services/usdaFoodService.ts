// ============================================================================
// USDA FoodData Central API Client (Server-side Only)
// Official Documentation: https://fdc.nal.usda.gov/api-guide.html
// ============================================================================

import { FoodNutritionItem, FoodNutrientValues } from '@/types';

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_FOOD_DATA_CENTRAL_API_KEY || 'DEMO_KEY';

interface CacheEntry {
  timestamp: number;
  data: FoodNutritionItem[];
}

const foodCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Nutrient IDs according to USDA FoodData Central
const NUTRIENT_IDS = {
  ENERGY: [1008, 2047, 2048], // kcal
  CARBS: [1005], // g
  SUGARS: [2000], // g
  FIBER: [1079], // g
  PROTEIN: [1003], // g
  FAT: [1004], // g
};

// Khmer translations for common staples & food queries
const KHMER_FOOD_MAP: Record<string, string> = {
  durian: 'ធូរេន',
  'white rice': 'បាយស',
  'brown rice': 'បាយសម្រូប',
  rice: 'បាយស',
  jasmine: 'ផ្កាម្លិះ',
  'morning glory': 'ត្រកួន',
  'water spinach': 'ត្រកួន',
  cabbage: 'ស្ពៃក្តោប',
  cucumber: 'ត្រសក់',
  fish: 'ត្រី',
  chicken: 'សាច់មាន់',
  pork: 'សាច់ជ្រូក',
  beef: 'សាច់គោ',
  shrimp: 'បង្គា',
  egg: 'ស៊ុត',
  banana: 'ចេក',
  apple: 'ផ្លែប៉ោម',
  orange: 'ផ្លែក្រូច',
  mango: 'ផ្លែស្វាយ',
  papaya: 'ល្ហុង',
  guava: 'ត្របែក',
  watermelon: 'ឪឡឹក',
  jackfruit: 'ខ្នុរ',
  noodle: 'គុយទាវ / មី',
  bread: 'នំប៉័ង',
  milk: 'ទឹកដោះគោ',
  tofu: 'តៅហ៊ូ',
  soup: 'សម្ល / ស៊ុប',
  vegetable: 'បន្លែ',
};

function extractNutrientValue(
  nutrients: any[],
  ids: number[],
): number | undefined {
  if (!Array.isArray(nutrients)) return undefined;
  const match = nutrients.find(
    (n) => ids.includes(n.nutrientId) || ids.includes(Number(n.nutrientNumber)),
  );
  if (match && typeof match.value === 'number') {
    return Math.round(match.value * 10) / 10;
  }
  return undefined;
}

/**
 * Normalizes USDA Food item into standardized FoodNutritionItem
 */
export function normalizeUsdaFood(rawFood: any): FoodNutritionItem {
  const nutrients = rawFood.foodNutrients || [];

  const per100g: FoodNutrientValues = {
    caloriesKcal: extractNutrientValue(nutrients, NUTRIENT_IDS.ENERGY),
    carbohydratesG: extractNutrientValue(nutrients, NUTRIENT_IDS.CARBS),
    totalSugarsG: extractNutrientValue(nutrients, NUTRIENT_IDS.SUGARS),
    dietaryFiberG: extractNutrientValue(nutrients, NUTRIENT_IDS.FIBER),
    proteinG: extractNutrientValue(nutrients, NUTRIENT_IDS.PROTEIN),
    totalFatG: extractNutrientValue(nutrients, NUTRIENT_IDS.FAT),
  };

  let perServing: FoodNutrientValues | undefined = undefined;
  const servingSize =
    typeof rawFood.servingSize === 'number' ? rawFood.servingSize : undefined;
  const servingSizeUnit = rawFood.servingSizeUnit || 'g';

  if (servingSize && servingSize > 0) {
    const factor = servingSize / 100;
    perServing = {
      caloriesKcal:
        per100g.caloriesKcal !== undefined
          ? Math.round(per100g.caloriesKcal * factor)
          : undefined,
      carbohydratesG:
        per100g.carbohydratesG !== undefined
          ? Math.round(per100g.carbohydratesG * factor * 10) / 10
          : undefined,
      totalSugarsG:
        per100g.totalSugarsG !== undefined
          ? Math.round(per100g.totalSugarsG * factor * 10) / 10
          : undefined,
      dietaryFiberG:
        per100g.dietaryFiberG !== undefined
          ? Math.round(per100g.dietaryFiberG * factor * 10) / 10
          : undefined,
      proteinG:
        per100g.proteinG !== undefined
          ? Math.round(per100g.proteinG * factor * 10) / 10
          : undefined,
      totalFatG:
        per100g.totalFatG !== undefined
          ? Math.round(per100g.totalFatG * factor * 10) / 10
          : undefined,
    };
  }

  // Attempt Khmer name lookup
  const lowerDesc = (rawFood.description || '').toLowerCase();
  let descriptionKm: string | undefined = undefined;
  for (const [enKey, kmVal] of Object.entries(KHMER_FOOD_MAP)) {
    if (lowerDesc.includes(enKey)) {
      descriptionKm = kmVal;
      break;
    }
  }

  return {
    fdcId: rawFood.fdcId,
    description: rawFood.description || 'Food Item',
    descriptionKm,
    brandOwner: rawFood.brandOwner || rawFood.brandName || undefined,
    servingSize,
    servingSizeUnit,
    householdServingText: rawFood.householdServingFullText || undefined,
    per100g,
    perServing,
    foodCategory: rawFood.foodCategory || undefined,
    sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${rawFood.fdcId}/nutrients`,
  };
}

/**
 * Searches the official USDA FoodData Central API
 */
export async function searchUsdaFoods(
  query: string,
  pageSize = 8,
): Promise<FoodNutritionItem[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const cacheKey = `${normalizedQuery}_${pageSize}`;
  const cached = foodCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const endpoint = `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(
    normalizedQuery,
  )}&pageSize=${pageSize}&api_key=${encodeURIComponent(USDA_API_KEY)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FamilyDiabetesCare/1.0 (Nutrition Education Module)',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `USDA FoodData Central API error: ${res.status} ${res.statusText}`,
      );
      return [];
    }

    const data = await res.json();
    const foods = Array.isArray(data.foods)
      ? data.foods.map(normalizeUsdaFood)
      : [];

    foodCache.set(cacheKey, {
      timestamp: Date.now(),
      data: foods,
    });

    return foods;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(
      'Error fetching from USDA FoodData Central:',
      error.message || error,
    );
    return [];
  }
}

/**
 * Get detailed food item by FDC ID
 */
export async function getUsdaFoodDetail(
  fdcId: number,
): Promise<FoodNutritionItem | null> {
  const endpoint = `${USDA_API_BASE}/food/${fdcId}?api_key=${encodeURIComponent(USDA_API_KEY)}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FamilyDiabetesCare/1.0 (Nutrition Education Module)',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return normalizeUsdaFood(data);
  } catch (err: any) {
    console.warn(`Error fetching USDA food ${fdcId}:`, err.message || err);
    return null;
  }
}
