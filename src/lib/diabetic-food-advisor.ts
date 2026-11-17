// ============================================================================
// Clinical Diabetic Food & Portion Advisor
// Sourced from ADA Standards of Care & Diabetes Plate Method
// Provides dynamic portion sizes, glycemic ratings, and safe eating rules
// ============================================================================

import { FoodNutritionItem } from '@/types';

export type DiabeticVerdict = 'eat_freely' | 'portion_control' | 'strict_limit';
export type FoodPlateCategory = 'vegetables' | 'protein' | 'carbs' | 'fruit' | 'caution';

export interface DiabeticPortionAdvice {
  verdict: DiabeticVerdict;
  plateCategory: FoodPlateCategory;
  verdictTitleEn: string;
  verdictTitleKm: string;
  verdictBadgeClass: string;
  portionGuideEn: string;
  portionGuideKm: string;
  glycemicImpactEn: string;
  glycemicImpactKm: string;
  howToEatEn: string;
  howToEatKm: string;
  healthierSwapEn?: string;
  healthierSwapKm?: string;
  netCarbsG?: number;
}

// Food category regex patterns
const DURIAN_REGEX = /\b(durian)\b/i;
const TROPICAL_HIGH_SUGAR_REGEX = /\b(jackfruit|longan|rambutan|lychee|custard apple|sugar apple|tamarind|date|dates|raisin|prune|dried fruit)\b/i;
const NON_STARCHY_VEG_REGEX = /(morning glory|water spinach|spinach|cabbage|cucumber|lettuce|broccoli|cauliflower|kale|bok choy|eggplant|zucchini|bell pepper|celery|asparagus|green bean|mushroom|onion|garlic|radish|sprout|tomato|ivy gourd|gourd|papaya, green|mustard green|watercress|herb)/i;
const STARCHY_VEG_REGEX = /\b(potato|potatoes|sweet potato|yam|cassava|taro|corn)\b/i;
const LEAN_PROTEIN_REGEX = /(fish|salmon|tuna|cod|tilapia|snakehead|catfish|chicken breast|chicken, breast|turkey|tofu|boiled egg|egg, whole|egg white|prawn|shrimp|crab|mussel|lean beef|pork tenderloin)/i;
const REFINED_CARBS_REGEX = /(white rice|jasmine rice|sticky rice|glutinous rice|rice, white|bread, white|white bread|noodle|rice noodle|pasta|vermicelli|french fries|potato chips|donut|cake|cookie|soda|syrup|candy|sweetened|condensed milk)/i;
const WHOLE_GRAINS_LEGUMES_REGEX = /(brown rice|wild rice|oat|oats|quinoa|lentil|chickpea|black bean|mung bean|soybean)/i;
const WHOLE_FRUIT_REGEX = /(apple|banana|orange|mango|grape|watermelon|papaya|guava|dragon fruit|berry|strawberry|blueberry|pear|peach|plum|melon)/i;
const NUTS_SEEDS_REGEX = /\b(nut|nuts|almond|cashew|walnut|peanut|peanuts|chia|flax|pumpkin seed|sunflower seed)\b/i;
const BEVERAGE_REGEX = /\b(juice|soda|cola|beverage|drink|tea|coffee|smoothie|shake)\b/i;

/**
 * Evaluates a food item and provides dynamic, clinically sound portion and suitability advice
 */
export function getDiabeticFoodAdvice(food: FoodNutritionItem): DiabeticPortionAdvice {
  const desc = (food.description || '').toLowerCase();
  const per100g = food.per100g;
  const carbs = per100g.carbohydratesG ?? 0;
  const sugars = per100g.totalSugarsG ?? 0;
  const fiber = per100g.dietaryFiberG ?? 0;
  const protein = per100g.proteinG ?? 0;
  const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
  const servingText = food.householdServingText ? ` (${food.householdServingText})` : '';

  // 1. Durian (Specific high-calorie, high-sugar tropical fruit)
  if (DURIAN_REGEX.test(desc)) {
    return {
      verdict: 'strict_limit',
      plateCategory: 'caution',
      verdictTitleEn: 'High Caution (Dense Sugar & Calorie Fruit)',
      verdictTitleKm: 'ប្រុងប្រយ័ត្នខ្ពស់ (ផ្លែឈើជាតិស្ករ និងកាឡូរីច្រើន)',
      verdictBadgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      portionGuideEn: 'Strictly limit to 1 small seed / segment (approx. 40–50g). Avoid eating multiple segments.',
      portionGuideKm: 'កម្រិតយ៉ាងតឹងរ៉ឹងត្រឹម ១ កញ្ចង់តូច (១ គ្រាប់តូច ប្រហែល ៤០–៥០ ក្រាម)។ មិនត្រូវញ៉ាំច្រើនគ្រាប់ឡើយ។',
      glycemicImpactEn: 'High Glycemic Impact. Rich in sucrose, fructose, and fats that cause acute glucose and lipid spikes.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករខ្ពស់។ សម្បូរជាតិស្ករ និងខ្លាញ់ដែលធ្វើឱ្យជាតិស្ករហក់ឡើងលឿន និងកាឡូរីខ្ពស់។',
      howToEatEn: 'Never eat on an empty stomach. Eat only 1 small seed after a fiber-rich meal, and test blood sugar 2 hours later.',
      howToEatKm: 'កុំញ៉ាំពេលពោះទទេឱ្យសោះ។ ញ៉ាំត្រឹម ១ គ្រាប់តូចក្រោយបាយដែលមានបន្លែច្រើន ហើយវាស់ជាតិស្ករ ២ ម៉ោងក្រោយមក។',
      healthierSwapEn: 'Swap with lower-GI fresh fruits such as crisp green guava, green apple, or pomelo.',
      healthierSwapKm: 'ជ្រើសរើសផ្លែឈើដែលមានសន្ទស្សន៍ស្ករទាបជំនួសវិញ ដូចជាផ្លែត្របែកស្រគាល ប៉ោមបៃតង ឬក្រូចថ្លុង។',
      netCarbsG: netCarbs
    };
  }

  // 2. Other High-Sugar Tropical & Dried Fruits (Jackfruit, Longan, Lychee, Dates, Raisins)
  if (TROPICAL_HIGH_SUGAR_REGEX.test(desc) || (sugars >= 20 && fiber < 3)) {
    return {
      verdict: 'strict_limit',
      plateCategory: 'caution',
      verdictTitleEn: 'Strict Portion Control (High Natural Sugars)',
      verdictTitleKm: 'កម្រិតតឹងរ៉ឹង (ជាតិស្ករធម្មជាតិខ្ពស់)',
      verdictBadgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      portionGuideEn: 'Strictly limit to 1–2 small pieces (or 1 tablespoon for dried fruit). Highly concentrated sugar.',
      portionGuideKm: 'កម្រិតត្រឹម ១ ទៅ ២ គ្រាប់តូច (ឬ ១ ស្លាបព្រាបាយសម្រាប់ផ្លែឈើក្រៀម)។ មានជាតិស្ករប្រមូលផ្តុំខ្ពស់។',
      glycemicImpactEn: 'High GI. Concentrated fructose rapidly enters the bloodstream.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករខ្ពស់។ ជាតិស្ករប្រមូលផ្តុំស្រូបចូលចរន្តឈាមលឿន។',
      howToEatEn: 'Eat a single piece as a treat only after physical activity or after a high-protein meal.',
      howToEatKm: 'ញ៉ាំត្រឹម ១ គ្រាប់ជាចំណីសម្រន់ក្រោយធ្វើចលនា ឬក្រោយអាហារដែលមានប្រូតេអ៊ីន។',
      healthierSwapEn: 'Choose fresh berries, guava, or small green apples instead.',
      healthierSwapKm: 'ជ្រើសរើសផ្លែស្ត្រប៊ឺរី ត្របែក ឬផ្លែប៉ោមបៃតងជំនួសវិញ។',
      netCarbsG: netCarbs
    };
  }

  // 3. Non-Starchy Vegetables (Eat Freely - Fill 1/2 Plate)
  if (NON_STARCHY_VEG_REGEX.test(desc) || (carbs <= 7 && fiber >= 1.5 && protein < 8)) {
    return {
      verdict: 'eat_freely',
      plateCategory: 'vegetables',
      verdictTitleEn: 'Eat Freely (Non-Starchy Vegetable)',
      verdictTitleKm: 'ញ៉ាំដោយសេរី (បន្លែគ្មានជាតិម្សៅ)',
      verdictBadgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      portionGuideEn: 'Generous 1 to 2 cups (cooked) or fill half of Mom\'s plate. Eat as much as desired!',
      portionGuideKm: '១ ទៅ ២ ចានចង្កឹះ (ស្ងោរ ឬស្ល) ឬដាក់ឱ្យបានកន្លះចានបាយរបស់ម៉ាក់។ អាចញ៉ាំបានច្រើនតាមចិត្ត!',
      glycemicImpactEn: 'Very Low GI. Virtually no blood sugar spike. Natural fiber slows glucose uptake.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករទាបបំផុត។ មិនធ្វើឱ្យឡើងជាតិស្ករឡើយ ហើយជាតិសរសៃជួយពន្យឺតការស្រូបជាតិស្ករ។',
      howToEatEn: 'Eat this FIRST at the beginning of the meal before eating rice or protein to blunt glucose spikes.',
      howToEatKm: 'ញ៉ាំបន្លែនេះមុនគេបង្អស់ក្នុងពេលបាយ មុនពេលចាប់ផ្តើមញ៉ាំបាយ ឬសាច់ ដើម្បីទប់កុំឱ្យជាតិស្ករហក់ឡើង។',
      netCarbsG: netCarbs
    };
  }

  // 4. Starchy Vegetables (Potato, Sweet Potato, Cassava, Corn)
  if (STARCHY_VEG_REGEX.test(desc)) {
    return {
      verdict: 'portion_control',
      plateCategory: 'carbs',
      verdictTitleEn: 'Moderate Portion (Starchy Vegetable)',
      verdictTitleKm: 'កម្រិតមធ្យម (បន្លែមានជាតិម្សៅ)',
      verdictBadgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      portionGuideEn: '1 small piece (approx. 1/2 medium tuber or 1/2 cup). Counts as Mom\'s carbohydrate section (1/4 plate).',
      portionGuideKm: '១ មើមតូច (ប្រហែល ១/២ មើមមធ្យម ឬ ១/២ ចាន)។ រាប់បញ្ចូលក្នុងចំណែកម្សៅ ១/៤ នៃចាន។',
      glycemicImpactEn: 'Medium to High GI. Boiled or steamed with skin is better than fried or mashed.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករមធ្យមទៅខ្ពស់។ ស្ងោរ ឬចំហុយទាំងសំបកល្អជាងការបំពង ឬកិនម៉ដ្ឋ។',
      howToEatEn: 'When eating starchy vegetables, reduce the portion of white rice correspondingly.',
      howToEatKm: 'នៅពេលញ៉ាំដំឡូង ឬពោត ត្រូវកាត់បន្ថយបរិមាណបាយសក្នុងពេលជាមួយគ្នា។',
      netCarbsG: netCarbs
    };
  }

  // 5. Lean Proteins & Eggs (Fill 1/4 Plate)
  if (LEAN_PROTEIN_REGEX.test(desc) || (protein >= 12 && carbs <= 6)) {
    const isEgg = /egg/i.test(desc);
    return {
      verdict: 'eat_freely',
      plateCategory: 'protein',
      verdictTitleEn: 'Healthy Protein (Fill 1/4 Plate)',
      verdictTitleKm: 'ប្រូតេអ៊ីនសុខភាព (ដាក់ ១/៤ នៃចាន)',
      verdictBadgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
      portionGuideEn: isEgg
        ? '1 to 2 whole eggs (boiled, steamed, or poached preferred).'
        : 'Palm-sized portion (approx. 90–120g / 3–4 oz, or 1 fillet). Fills 1/4 of plate.',
      portionGuideKm: isEgg
        ? '១ ទៅ ២ គ្រាប់ (ស្ងោរ ឬចំហុយគឺល្អបំផុត)។'
        : 'ទំហំប៉ុនបាតដៃ (ប្រហែល ៩០–១២០ ក្រាម ឬ ១ ដុំត្រី) ស្មើនឹង ១/៤ នៃចាន។',
      glycemicImpactEn: 'Zero to Minimal GI. Protein prevents daytime hunger and stabilizes blood glucose.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករទាបបំផុត គ្មានជាតិម្សៅ ជួយឱ្យឆ្អែតបានយូរ និងរក្សាលំនឹងជាតិស្ករ។',
      howToEatEn: 'Steam, boil, or grill with minimal cooking oil. Pair with clear vegetable soups (Samlor Korko/Proher).',
      howToEatKm: 'ចំហុយ ស្ងោរ ឬអាំងដោយប្រើប្រេងតិច។ ញ៉ាំជាមួយសម្លបន្លែ ឬបន្លែស្រស់។',
      netCarbsG: netCarbs
    };
  }

  // 6. Nuts & Healthy Seeds
  if (NUTS_SEEDS_REGEX.test(desc)) {
    return {
      verdict: 'portion_control',
      plateCategory: 'protein',
      verdictTitleEn: 'Healthy Fats (Small Handful)',
      verdictTitleKm: 'ខ្លាញ់សុខភាព (១ ក្តាប់ដៃតូច)',
      verdictBadgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
      portionGuideEn: '1 small handful (approx. 25–30g or 1 oz, about 15–20 nuts).',
      portionGuideKm: '១ ក្តាប់ដៃតូច (ប្រហែល ២៥–៣០ ក្រាម ឬ ១៥–២០ គ្រាប់)។',
      glycemicImpactEn: 'Very Low GI. Healthy fats and protein blunt carbohydrate digestion.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករទាបណាស់។ ខ្លាញ់ល្អ និងប្រូតេអ៊ីនជួយពន្យឺតការស្រូបជាតិស្ករ។',
      howToEatEn: 'Choose unsalted, raw, or dry-roasted nuts. Great as a healthy afternoon snack.',
      howToEatKm: 'ជ្រើសរើសប្រភេទមិនប្រៃ ឬលីងធម្មតា។ ល្អបំផុតសម្រាប់ញ៉ាំសម្រន់ពេលរសៀល។',
      netCarbsG: netCarbs
    };
  }

  // 7. Refined Carbohydrates & Sweets (Strict Limit - High Spike Risk)
  if (REFINED_CARBS_REGEX.test(desc) || carbs >= 55 || sugars >= 18) {
    const isRice = /rice/i.test(desc);
    return {
      verdict: 'strict_limit',
      plateCategory: 'caution',
      verdictTitleEn: 'Strict Portion Control (High Spike Risk)',
      verdictTitleKm: 'កម្រិតតឹងរ៉ឹង (ប្រឈមនឹងការឡើងជាតិស្ករខ្ពស់)',
      verdictBadgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      portionGuideEn: isRice
        ? 'Limit to 1/2 cup (or max 3/4 cup, roughly 1 small fist) per meal. Never take a 2nd scoop.'
        : `Small measured portion${servingText || ' (approx. 1/2 cup or 1 small slice)'}. Never eat large portions.`,
      portionGuideKm: isRice
        ? 'កម្រិតយ៉ាងតឹងរ៉ឹងត្រឹម ១/២ ចានចង្កឹះ (ប្រហែល ១ ក្តាប់ដៃតូច)។ មិនត្រូវដួសថែមចានទី២ឡើយ។'
        : 'កម្រិតចំណែកតូច (ប្រហែល ១/២ ចាន ឬ ១ ចំណិតតូច)។ មិនត្រូវញ៉ាំច្រើនឡើយ។',
      glycemicImpactEn: 'High Glycemic Index. Fast digestion causes sharp post-meal blood sugar surges.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករខ្ពស់ (High GI)។ ស្រូបចូលលឿនបង្កឱ្យជាតិស្ករហក់ឡើងខ្លាំងក្រោយអាហារ។',
      howToEatEn: 'Always eat vegetables and protein first. Never eat high-carb grains on an empty stomach alone.',
      howToEatKm: 'ត្រូវតែញ៉ាំបន្លែ និងត្រី/សាច់ឱ្យបានច្រើនជាមុនសិន។ កុំញ៉ាំបាយសទទេពេលពោះទទេ។',
      healthierSwapEn: 'Replace half with brown rice, or bulk up with soup vegetables (Samlor Korko / Proher).',
      healthierSwapKm: 'លាយបាយសម្រូប ៥០% ឬដួសបន្លែសម្លកកូរ/សម្លប្រហើរជំនួសមួយចំណែក។',
      netCarbsG: netCarbs
    };
  }

  // 8. Whole Fruits (Portion Control / Moderate)
  if (WHOLE_FRUIT_REGEX.test(desc) || (sugars >= 7 && fiber >= 1.5)) {
    const isBanana = /banana/i.test(desc);
    const isMelon = /watermelon|melon|papaya/i.test(desc);
    const portionEn = isBanana
      ? '1 small banana (or 1/2 large banana). Prefer firm/slightly green over very ripe.'
      : isMelon
      ? '1 small wedge or 1 small cup diced (approx. 120g).'
      : '1 small whole fruit (e.g. 1 small apple, 1 small orange, or 1 guava).';
    const portionKm = isBanana
      ? '១ ផ្លែចេកតូច (ឬកន្លះផ្លែធំ)។ ជ្រើសរើសផ្លែដែលមិនទាន់ទុំជោរ។'
      : isMelon
      ? '១ ចំណិតតូច ឬ ១ ចានតូច (ប្រហែល ១២០ ក្រាម)។'
      : '១ ផ្លែតូច (ឧ. ផ្លែប៉ោមតូច ១ ផ្លែក្រូច ១ ឬផ្លែត្របែក ១)។';

    return {
      verdict: 'portion_control',
      plateCategory: 'fruit',
      verdictTitleEn: 'Portion Control (Whole Fruit Only)',
      verdictTitleKm: 'គ្រប់គ្រងបរិមាណ (ផ្លែឈើទាំងមូល)',
      verdictBadgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      portionGuideEn: portionEn,
      portionGuideKm: portionKm,
      glycemicImpactEn: 'Moderate GI. Natural fructose paired with dietary fiber. Avoid juices as they spike sugar instantly.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករមធ្យម។ ជៀសវាងទឹកផ្លែឈើកិន/ច្របាច់ ព្រោះវាធ្វើឱ្យឡើងជាតិស្ករលឿនបំផុត។',
      howToEatEn: 'Eat whole with skin when edible (e.g. apple, guava). Best consumed as an afternoon snack, not late at night.',
      howToEatKm: 'ញ៉ាំទាំងសំបកប្រសិនបើអាច (ដូចជាផ្លែប៉ោម ត្របែក)។ ញ៉ាំជាអាហារសម្រន់ពេលរសៀល មិនគួរញ៉ាំយប់ជ្រៅឡើយ។',
      netCarbsG: netCarbs
    };
  }

  // 9. Whole Grains & Legumes (Moderate - Fill 1/4 Plate)
  if (WHOLE_GRAINS_LEGUMES_REGEX.test(desc) || (carbs >= 15 && carbs < 55 && fiber >= 3)) {
    return {
      verdict: 'portion_control',
      plateCategory: 'carbs',
      verdictTitleEn: 'Moderate Portion (Complex Carbohydrate)',
      verdictTitleKm: 'កម្រិតមធ្យម (កាបូអ៊ីដ្រាតស្មុគស្មាញ)',
      verdictBadgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      portionGuideEn: '1/2 cup cooked (fills 1/4 of plate). Balanced source of slow-digesting energy.',
      portionGuideKm: '១/២ ចានចង្កឹះ (ស្មើនឹង ១/៤ នៃចានបាយ)។ ជាប្រភពថាមពលដែលស្រូបយឺតល្អ។',
      glycemicImpactEn: 'Medium to Low GI. Rich in fiber which buffers glucose absorption compared to white rice.',
      glycemicImpactKm: 'សន្ទស្សន៍ស្ករមធ្យមទៅទាប។ សម្បូរជាតិសរសៃជួយពន្យឺតការស្រូបជាតិស្ករបានល្អជាងបាយស។',
      howToEatEn: 'Pair with lean fish or chicken and ample green vegetables. Drink a glass of water.',
      howToEatKm: 'ញ៉ាំជាមួយត្រី ឬសាច់មាន់ និងបន្លែបៃតងឱ្យបានច្រើន។ ពិសាទឹក ១ កែវ។',
      netCarbsG: netCarbs
    };
  }

  // 10. General Dynamic Fallback (Based on verified serving & nutrient data)
  const isHighCarb = carbs > 30;
  const isHighProtein = protein >= 10;
  const defaultPortionEn = food.householdServingText
    ? `1 standard serving: ${food.householdServingText}.`
    : food.servingSize
    ? `${food.servingSize}${food.servingSizeUnit || 'g'} measured portion.`
    : isHighCarb
    ? 'Small measured portion (approx. 50–70g, fills 1/4 plate).'
    : 'Standard moderate serving (approx. 100g).';

  const defaultPortionKm = food.householdServingText
    ? `១ ចំណែកស្តង់ដារ៖ ${food.householdServingText}។`
    : food.servingSize
    ? `បរិមាណវាស់ប្រហែល ${food.servingSize}${food.servingSizeUnit || 'g'}។`
    : isHighCarb
    ? 'កម្រិតចំណែកតូច (ប្រហែល ៥០–៧០ ក្រាម ស្មើ ១/៤ ចាន)។'
    : 'ចំណែកមធ្យមស្តង់ដារ (ប្រហែល ១០០ ក្រាម)។';

  return {
    verdict: isHighCarb ? 'portion_control' : 'eat_freely',
    plateCategory: isHighProtein ? 'protein' : isHighCarb ? 'carbs' : 'vegetables',
    verdictTitleEn: isHighCarb ? 'Portion Control' : 'Moderate / Balanced Food',
    verdictTitleKm: isHighCarb ? 'គ្រប់គ្រងបរិមាណ' : 'អាហារតុល្យភាពល្មម',
    verdictBadgeClass: isHighCarb
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-emerald-100 text-emerald-900 border-emerald-300',
    portionGuideEn: defaultPortionEn,
    portionGuideKm: defaultPortionKm,
    glycemicImpactEn: isHighCarb
      ? 'Moderate carbohydrate content. Monitor post-meal response.'
      : 'Low glycemic impact. Balanced macronutrient profile.',
    glycemicImpactKm: isHighCarb
      ? 'មានជាតិម្សៅមធ្យម។ គួរតាមដានកម្រិតជាតិស្ករក្រោយអាហារ។'
      : 'សន្ទស្សន៍ស្ករទាប។ មានតុល្យភាពអាហារូបត្ថម្ភសមល្មម។',
    howToEatEn: 'Enjoy as part of a balanced plate alongside green vegetables and water.',
    howToEatKm: 'ទទួលទានជាផ្នែកមួយនៃចានសុខភាព រួមជាមួយបន្លែបៃតង និងទឹកស្អាត។',
    netCarbsG: netCarbs
  };
}
