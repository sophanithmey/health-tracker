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
  },
  {
    id: 'kuy-teav',
    nameKm: 'គុយទាវភ្នំពេញ (Kuy Teav Phnom Penh)',
    nameEn: 'Phnom Penh Pork & Rice Noodle Soup',
    category: 'noodle',
    descriptionKm: 'អាហារពេលព្រឹកដ៏ពេញនិយមដែលមានសរសៃគុយទាវអង្ករ សាច់ជ្រូក ថ្លើម ប្រហិត និងទឹកស៊ុបឆ្អឹងជ្រូកដ៏ឈ្ងុយឆ្ងាញ់',
    descriptionEn: 'Classic Cambodian breakfast noodle soup with rice noodles, lean minced pork, meatballs, and fragrant broth.',
    carbLevel: 'moderate',
    keyComponents: {
      vegetables: ['សណ្តែកបណ្តុះ (Bean sprouts)', 'ស្លឹកខ្ទឹម និងជីវ៉ាន់ស៊ុយ (Scallions & celery)'],
      protein: ['សាច់ជ្រូកចិញ្ច្រាំគ្មានខ្លាញ់ (Lean minced pork)', 'ប្រហិតសាច់ (Meatballs)'],
      carbohydrates: ['សរសៃគុយទាវអង្ករ (Rice noodles)']
    },
    portionGuidanceKm: 'សុំបន្ថែមសណ្តែកបណ្តុះឱ្យច្រើន កាត់បន្ថយសរសៃគុយទាវមកត្រឹម ១/២ ចាន និងកុំផឹកទឹកស៊ុបដែលសល់ច្រើនព្រោះមានជាតិផ្អែម និងប្រៃខ្ពស់',
    portionGuidanceEn: 'Request extra bean sprouts and fresh herbs. Limit rice noodles to half portion, and avoid drinking all broth to reduce hidden sugar and sodium.',
    educationalTipKm: 'ការញ៉ាំសណ្តែកបណ្តុះ និងសាច់មុនសរសៃគុយទាវ ជួយបន្ថយល្បឿននៃការឡើងជាតិស្ករក្នុងឈាម',
    educationalTipEn: 'Eating fiber-rich bean sprouts and lean protein before the rice noodles flattens post-meal glucose spikes.'
  },
  {
    id: 'lok-lak',
    nameKm: 'ឡុកឡាក់សាច់គោ (Beef Lok Lak)',
    nameEn: 'Stir-Fried Peppery Beef with Lime Dip',
    category: 'main',
    descriptionKm: 'សាច់គោឆាជាមួយគ្រឿងផ្សំឈ្ងុយឆ្ងាញ់ ទទួលទានជាមួយទឹកជ្រលក់ម្រេចកំពតក្រូចឆ្មា និងបន្លែសាឡាដស្រស់',
    descriptionEn: 'Tender wok-seared beef cubes served over fresh lettuce, tomatoes, cucumbers, and a zesty Kampot pepper lime dipping sauce.',
    carbLevel: 'low',
    keyComponents: {
      vegetables: ['សាឡាដស្រស់ (Crisp lettuce)', 'ប៉េងប៉ោះ (Tomatoes)', 'ត្រសក់ (Cucumbers)', 'ខ្ទឹមបារាំង (Sweet onions)'],
      protein: ['សាច់គោទន់គ្មានខ្លាញ់ (Lean beef tenderloin)'],
      carbohydrates: ['ស្ករត្នោតបន្តិចក្នុងទឹកជ្រលក់ (Trace sugar in marinade)']
    },
    portionGuidanceKm: 'អាចញ៉ាំសាច់គោ និងបន្លែសាឡាដបានច្រើនដោយសុវត្ថិភាព ប៉ុន្តែគួរកំណត់បាយសត្រឹម ១/២ កែវ ឬជ្រើសរើសបាយសម្រូបជំនួស',
    portionGuidanceEn: 'Enjoy the lean beef and generous fresh salad freely. Strictly cap accompanying white jasmine rice to 1/2 cup or substitute with brown rice.',
    educationalTipKm: 'សាច់គោផ្ដល់ជាតិដែក និងប្រូតេអ៊ីនខ្ពស់ដែលមិនធ្វើឱ្យឡើងជាតិស្ករទេ ចៀសវាងការជ្រលក់ទឹកស៊ីអ៊ីវផ្អែមច្រើនពេក',
    educationalTipEn: 'High protein and minimal starch provide great glycemic stability. Be mindful of added sugar in commercial dipping sauces.'
  },
  {
    id: 'chhar-knyei',
    nameKm: 'ឆាខ្ញីសាច់មាន់ (Chicken Ginger Stir-Fry)',
    nameEn: 'Wok-Tossed Chicken with Shredded Young Ginger',
    category: 'main',
    descriptionKm: 'សាច់មាន់ស្រែឆាជាមួយខ្ញីខ្ចីឈូសល្អិតៗ និងស្លឹកខ្ទឹម មានរសជាតិហឹរស្រាល និងជួយសម្រួលការរំលាយអាហារ',
    descriptionEn: 'Aromatic stir-fried tender chicken with julienned fresh ginger, garlic, and scallions in a light savory sauce.',
    carbLevel: 'low',
    keyComponents: {
      vegetables: ['ខ្ញីខ្ចី (Young ginger)', 'ស្លឹកខ្ទឹម (Scallions)', 'ម្ទេសប្លោក (Sweet peppers)'],
      protein: ['ទ្រូងមាន់ ឬសាច់មាន់គ្មានស្បែក (Skinless chicken breast)'],
      carbohydrates: ['សណ្តែកបណ្តុះ ឬបន្លែអម (Accompanying veggies)']
    },
    portionGuidanceKm: 'ជាម្ហូបដ៏ល្អសម្រាប់អ្នកជំងឺទឹកនោមផ្អែម អាចញ៉ាំបាន ១ ចានចង្កឹះ ញ៉ាំគូជាមួយបាយកន្លះចាន និងសម្លកំដរ',
    portionGuidanceEn: 'Outstanding low-carb option for diabetes. Enjoy 1 full serving paired with 1/2 cup of rice and a light vegetable broth.',
    educationalTipKm: 'ខ្ញីស្រស់មានសារធាតុ Gingerol ដែលជួយសម្រួលលំហូរឈាម និងជួយកោសិកាឱ្យប្រើប្រាស់អាំងស៊ុយលីនបានល្អប្រសើរជាងមុន',
    educationalTipEn: 'Fresh ginger contains active gingerols that support healthy insulin sensitivity and circulation.'
  },
  {
    id: 'samlor-prohir',
    nameKm: 'សម្លប្រហើរត្រី និងបន្លែស្រែ (Samlor Prohir)',
    nameEn: 'Fragrant Lemongrass Herbal Fish & Country Veggie Soup',
    category: 'soup',
    descriptionKm: 'សម្លខ្មែរស្រាលស្រទន់ដែលផ្សំពីត្រីរ៉ស់ ស្លឹកបាស ល្ពៅខ្ចី ននោង និងត្រឡាច ជាមួយគ្រឿងបុកធម្មជាតិ',
    descriptionEn: 'Gentle, clear herbal soup simmered with freshwater fish, young pumpkin, luffa gourd, wax gourd, and aromatic wild greens.',
    carbLevel: 'low',
    keyComponents: {
      vegetables: ['ននោង (Luffa gourd)', 'ស្លឹកបាស (Ivy gourd leaves)', 'ត្រឡាច (Wax gourd)', 'ល្ពៅខ្ចី (Young green pumpkin)'],
      protein: ['ត្រីរ៉ស់ ឬត្រីអណ្តែង (Freshwater fish)'],
      carbohydrates: ['គ្រឿងស្លឹកគ្រៃ រមៀត (Herbal kroeung seasoning)']
    },
    portionGuidanceKm: 'អាចញ៉ាំបានដោយសេរី (១ ទៅ ២ ចានធំ) ទឹកសម្លផ្អែមដោយសារបន្លែធម្មជាតិ គ្មានជាតិស្ករកែច្នៃឡើយ',
    portionGuidanceEn: 'Safe to eat freely (1-2 hearty bowls). The natural vegetable sweetness requires zero refined sugar.',
    educationalTipKm: 'បន្លែដូចជាននោង និងស្លឹកបាស មានជាតិទឹក និងជាតិសរសៃខ្ពស់ ដែលជួយឱ្យឆ្អែតបានយូរ និងទប់ទល់ការឃ្លានអាហារផ្អែម',
    educationalTipEn: 'High water and fiber content in luffa and gourds provides lasting satiety and aids steady glucose balance.'
  },
  {
    id: 'nom-krouk',
    nameKm: 'នំគ្រក់ខ្ទិះដូង (Nom Krouk)',
    nameEn: 'Crispy Savory Coconut Rice Cakes with Scallions',
    category: 'staple',
    descriptionKm: 'នំប្រពៃណីខ្មែរដុតក្នុងពុម្ពដីឥដ្ឋ ផ្សំពីម្សៅអង្ករ ខ្ទិះដូង និងស្លឹកខ្ទឹម ស្រួយខាងក្រៅ ទន់ខាងក្នុង ជ្រលក់ទឹកត្រីផ្អែមល្មម',
    descriptionEn: 'Traditional savory-sweet street snacks baked in terracotta griddles, made of rice batter, coconut cream, and scallions.',
    carbLevel: 'high',
    keyComponents: {
      vegetables: ['ស្លឹកខ្ទឹមហាន់ (Chopped chives/scallions)'],
      protein: [],
      carbohydrates: ['ម្សៅអង្ករ (Rice flour)', 'ខ្ទិះដូង (Coconut cream)', 'ទឹកត្រីផ្អែម (Sweet dipping sauce)']
    },
    portionGuidanceKm: 'គួរញ៉ាំត្រឹម ២ ទៅ ៣ គ្រាប់ប៉ុណ្ណោះជាអាហារសម្រន់ ចៀសវាងការជ្រលក់ទឹកត្រីផ្អែមច្រើនជ្រុល',
    portionGuidanceEn: 'Treat as an occasional indulgence: limit strictly to 2-3 pieces. Lightly dip in sauce or skip sugar-sweetened fish sauce.',
    educationalTipKm: 'ម្សៅអង្ករកិនម៉ត់ និងខ្ទិះដូងងាយបង្កើនកម្រិតជាតិស្ករក្នុងឈាម គួរញ៉ាំអមជាមួយតែបៃតងក្តៅគ្មានជាតិស្ករ',
    educationalTipEn: 'Refined rice batter and coconut fat slow digestion but cause late blood glucose rises; pair with unsweetened hot green tea.'
  }
];

