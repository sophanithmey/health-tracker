// ============================================================================
// Cambodian Diabetes Care Food Guide (មគ្គុទ្ទេសក៍អាហារូបត្ថម្ភខ្មែរ)
// Educational guidance on portion balance, carbs, protein & non-starchy vegetables
// ============================================================================

export interface CambodianDish {
  id: string;
  nameKm: string;
  nameEn: string;
  category: 'soup' | 'main' | 'noodle' | 'vegetable' | 'fruit' | 'staple';
  descriptionKm: string;
  descriptionEn: string;
  carbLevel: 'low' | 'moderate' | 'high';
  keyComponents: {
    vegetables: string[];
    protein: string[];
    carbohydrates: string[];
  };
  portionGuidanceKm: string;
  portionGuidanceEn: string;
  educationalTipKm: string;
  educationalTipEn: string;
}

export const CAMBODIAN_FOOD_GUIDE: CambodianDish[] = [
  {
    id: 'samlor-korko',
    nameKm: 'សម្លកកូរ (Samlor Korko)',
    nameEn: 'Traditional Mixed Vegetable & Fish Stew',
    category: 'soup',
    descriptionKm: 'សម្លខ្មែរបុរាណដែលសម្បូរទៅដោយបន្លែបៃតងចម្រុះ ដូចជាស្លឹកបាស ល្ហុងខ្ចី ត្រប់ និងសាច់ត្រី ឬសាច់មាន់',
    descriptionEn: 'Traditional nourishing stew rich in leafy greens like ivy gourd leaves, green papaya, eggplants, and fresh fish.',
    carbLevel: 'low',
    keyComponents: {
      vegetables: ['ស្លឹកបាស (Ivy gourd leaves)', 'ល្ហុងខ្ចី (Green papaya)', 'ត្រប់ពុតលំញង (Thai eggplants)', 'ចេកខ្ចី (Green banana)'],
      protein: ['ត្រីរ៉ស់ ឬត្រីអណ្តែង (Freshwater fish)', 'សាច់មាន់ស្រែ (Chicken)'],
      carbohydrates: ['អង្ករលីងបុក (Roasted rice powder - small amount)']
    },
    portionGuidanceKm: 'អាចញ៉ាំបន្លែ និងទឹកសម្លបានច្រើន (១ ទៅ ២ ចានចង្កឹះ) ដោយកាត់បន្ថយបាយកំដរ',
    portionGuidanceEn: 'Generous portions of vegetables and broth are beneficial (1-2 bowls). Pair with a measured scoop of rice.',
    educationalTipKm: 'ជាម្ហូបដ៏ល្អសម្រាប់សុខភាព ព្រោះសំបូរបន្លែគ្មានម្សៅ និងជាតិសរសៃខ្ពស់ ដែលជួយពន្យឺតការស្រូបជាតិស្ករ',
    educationalTipEn: 'High fiber from mixed non-starchy vegetables slows carbohydrate absorption.'
  },
  {
    id: 'bai-sach-chrouk',
    nameKm: 'បាយសាច់ជ្រូក (Bai Sach Chrouk)',
    nameEn: 'Grilled Marinated Pork with Jasmine Rice & Pickled Veggies',
    category: 'main',
    descriptionKm: 'អាហារពេលព្រឹកពេញនិយមនៅកម្ពុជា រួមមានសាច់ជ្រូកអាំង បាយស និងជ្រក់ត្រសក់ការ៉ុត',
    descriptionEn: 'Popular breakfast plate featuring thinly sliced grilled pork, steamed rice, and quick-pickled cucumbers and daikon.',
    carbLevel: 'high',
    keyComponents: {
      vegetables: ['ជ្រក់ត្រសក់ការ៉ុត (Pickled cucumbers & carrots)'],
      protein: ['សាច់ជ្រូកអាំងគ្មានខ្លាញ់ (Lean grilled pork)'],
      carbohydrates: ['បាយសផ្កាម្លិះ (Steamed jasmine white rice)']
    },
    portionGuidanceKm: 'កំណត់បរិមាណបាយត្រឹម ១ ចានតូច (១/២ កែវ) ហើយបន្ថែមជ្រក់ត្រសក់ ឬពងទាស្ងោរដើម្បីបង្កើនជាតិប្រូតេអ៊ីន',
    portionGuidanceEn: 'Moderate rice portion to 1/2 or 3/4 cup. Request lean cuts and prioritize pickled vegetables or add a boiled egg.',
    educationalTipKm: 'បាយសងាយបង្កើនកម្រិតជាតិស្ករលឿន ការញ៉ាំបន្លែ ឬសាច់មុនបាយ ជួយសម្រួលលំនឹងជាតិស្ករបានល្អ',
    educationalTipEn: 'White jasmine rice has a high glycemic index. Eating protein and vegetables before carbohydrates helps moderate spikes.'
  },
  {
    id: 'num-banh-chok',
    nameKm: 'នំបញ្ចុកសម្លប្រហើរ (Num Banh Chok)',
    nameEn: 'Khmer Rice Noodles with Herbal Green Fish Gravy',
    category: 'noodle',
    descriptionKm: 'នំបញ្ចុកស្រស់ទទួលទានជាមួយសម្លប្រហើរត្រីរ៉ស់ និងបន្លែស្រស់ចម្រុះជាច្រើនមុខ',
    descriptionEn: 'Fermented fresh rice vermicelli topped with aromatic lemongrass freshwater fish gravy and raw greens.',
    carbLevel: 'moderate',
    keyComponents: {
      vegetables: ['ត្រួយត្រកួន (Water spinach stems)', 'ផ្កាស្នោរ (Sesbania flowers)', 'ត្រសក់ឈូស (Cucumbers)', 'ត្រយ៉ូងចេក (Banana blossom)'],
      protein: ['សាច់ត្រីរ៉ស់កិន (Minced snakehead fish)'],
      carbohydrates: ['សរសៃនំបញ្ចុក (Rice vermicelli)']
    },
    portionGuidanceKm: 'ដាក់បន្លែស្រស់ឱ្យបានច្រើន (ស្មើកន្លះចាន) ហើយដាក់សរសៃនំបញ្ចុកល្មម (ប្រហែល ១ ចានចង្កឹះ)',
    portionGuidanceEn: 'Fill half the bowl with raw crunchy herbs and greens; keep noodles to 1 small bowl.',
    educationalTipKm: 'បន្លែស្រស់ដូចជាត្រយ៉ូងចេក និងត្រសក់ ជួយឱ្យឆ្អែតបានយូរដោយមិនបង្កើនជាតិស្ករខ្លាំង',
    educationalTipEn: 'Crisp banana blossom, cucumber, and raw greens add substantial volume and satiety without spiking glucose.'
  },
  {
    id: 'amok-trey',
    nameKm: 'អាម៉ុកត្រី (Amok Trey)',
    nameEn: 'Steamed Fish Curry with Noni Leaves',
    category: 'main',
    descriptionKm: 'សាច់ត្រីចំហុយជាមួយគ្រឿងការីខ្មែរ ខ្ទិះដូងស្រាល និងទ្រាប់ស្លឹកញ (ស្លឹកញរ) ដ៏មានឱជារស',
    descriptionEn: 'Gentle steamed fish curry flavored with kroeung and mild coconut cream, layered over nutrient-rich noni leaves.',
    carbLevel: 'low',
    keyComponents: {
      vegetables: ['ស្លឹកញ (Noni leaves)'],
      protein: ['សាច់ត្រីទន្លេ (Freshwater fish fillets)'],
      carbohydrates: ['ស្ករត្នោតបន្តិចបន្តួចក្នុងគ្រឿង (Trace palm sugar in seasoning)']
    },
    portionGuidanceKm: 'អាចញ៉ាំអាម៉ុកបាន ១ កូនចាន ដោយសារសម្បូរប្រូតេអ៊ីន ជ្រើសរើសបរិភោគជាមួយបាយសម្រូបកម្រិតល្មម',
    portionGuidanceEn: 'Enjoy 1 portion of fish amok with plenty of steamed noni leaves. Accompany with a moderate portion of whole-grain rice.',
    educationalTipKm: 'ស្លឹកញផ្ដល់ជាតិប្រឆាំងអុកស៊ីតកម្ម និងមិនមានជាតិម្សៅឡើយ គួរប្រយ័ត្នបរិមាណខ្ទិះដូងខាប់ពេក',
    educationalTipEn: 'Noni leaves offer excellent non-starchy nutrition; enjoy preparations with balanced rather than excessively heavy coconut cream.'
  },
  {
    id: 'samlor-machu-kroeung',
    nameKm: 'សម្លម្ជូរគ្រឿងត្រកួន (Samlor Machu Kroeung)',
    nameEn: 'Sour Lemongrass Herb Soup with Water Spinach & Fish',
    category: 'soup',
    descriptionKm: 'សម្លម្ជូរគ្រឿងខ្មែរដែលមានក្លិនឈ្ងុយពីស្លឹកក្រូចសើច រមៀត គល់ស្លឹកគ្រៃ និងត្រកួនខ្ចីៗ',
    descriptionEn: 'Fragrant sour lemongrass herbal soup cooked with tender morning glory (water spinach) and fish or lean beef.',
    carbLevel: 'low',
    keyComponents: {
      vegetables: ['ត្រកួន (Water spinach)', 'ម្ជូរអំពិល ឬសណ្ដាន់ (Tamarind / Sandan souring agents)'],
      protein: ['ត្រីរ៉ស់ ឬសាច់គោគ្មានខ្លាញ់ (Fish or lean beef)'],
      carbohydrates: ['គ្រឿងបុកធម្មជាតិ (Lemongrass, turmeric herbs)']
    },
    portionGuidanceKm: 'ញ៉ាំត្រកួន និងសាច់ត្រីឱ្យបានគ្រប់គ្រាន់ ទឹកសម្លមានរសជាតិឆ្ងាញ់ដោយមិនចាំបាច់បន្ថែមស្ករច្រើន',
    portionGuidanceEn: 'Focus on liberal water spinach and fish servings. Keep seasoning lightly sour rather than overly sweetened.',
    educationalTipKm: 'ត្រកួនសម្បូរប៉ូតាស្យូម ជាតិសរសៃ និងជាតិដែក ដែលជួយដល់ចរន្តឈាម និងកាត់បន្ថយសម្ពាធឈាម',
    educationalTipEn: 'Water spinach provides high micronutrient density and dietary fiber without simple sugars.'
  },
  {
    id: 'rice-comparison',
    nameKm: 'បាយស vs បាយសម្រូប (White Rice vs Brown Rice)',
    nameEn: 'Rice Choices & Glycemic Awareness',
    category: 'staple',
    descriptionKm: 'ការប្រៀបធៀបរវាងបាយសផ្កាម្លិះធម្មតា និងបាយសម្រូប (អង្ករក្រហម/អង្ករសំរូប) សម្រាប់អ្នកជំងឺទឹកនោមផ្អែម',
    descriptionEn: 'Comparison of standard polished jasmine white rice versus unpolished brown / red rice for steady glucose curves.',
    carbLevel: 'high',
    keyComponents: {
      vegetables: [],
      protein: [],
      carbohydrates: ['គ្រាប់ធញ្ញជាតិ (Rice starch & complex fibers)']
    },
    portionGuidanceKm: 'មិនថាបាយស ឬបាយសម្រូបទេ គួរញ៉ាំត្រឹម ១ ចានចង្កឹះ (ប្រហែល ១៥០ ក្រាម) ក្នុងមួយពេល',
    portionGuidanceEn: 'Both white and brown rice are carbohydrates; cap portion at approx. 1 cup (150g) per meal and pair with protein.',
    educationalTipKm: 'បាយសម្រូបមានស្រទាប់កន្ទក់ដែលសម្បូរជាតិសរសៃ ជួយឱ្យជាតិស្ករឡើងយឺតជាងបាយសធម្មតា',
    educationalTipEn: 'Brown rice retains its outer bran layer, promoting slower glucose absorption and longer satiety.'
  },
  {
    id: 'cambodian-fruits',
    nameKm: 'ផ្លែឈើក្នុងស្រុក (Cambodian Fruits Guide)',
    nameEn: 'Local Cambodian Fruits & Portion Pacing',
    category: 'fruit',
    descriptionKm: 'ការជ្រើសរើសផ្លែឈើស្រស់៖ ស្រកានាគ ត្របែក ល្ហុងទុំ និងស្វាយទុំ',
    descriptionEn: 'Navigating delicious local fruits: dragon fruit, guava, papaya, and sweet ripe mango.',
    carbLevel: 'moderate',
    keyComponents: {
      vegetables: [],
      protein: [],
      carbohydrates: ['ជាតិស្ករផ្លែឈើធម្មជាតិ (Fructose & fiber)']
    },
    portionGuidanceKm: 'ផ្លែស្រកានាគ និងត្របែកអាចញ៉ាំបាន ១ ចំណិតធំ ឬ ១ ផ្លែតូច ស្វាយទុំផ្អែមខ្លាំង គួរញ៉ាំត្រឹម ២-៣ ចំណិតតូចៗប៉ុណ្ណោះ',
    portionGuidanceEn: 'Dragonfruit and guava are fiber-rich (1 small fruit / 1 wedge). Very ripe mango contains concentrated fructose, so enjoy 2-3 small slices.',
    educationalTipKm: 'ផ្លែឈើស្រស់មានវីតាមីនល្អ ប៉ុន្តែមានជាតិស្ករធម្មជាតិ ចៀសវាងការក្រឡុក ឬច្របាច់យកតែទឹក',
    educationalTipEn: 'Eat whole fresh fruits rather than fruit juices so the intact fiber moderates glycemic response.'
  }
];

