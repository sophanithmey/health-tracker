// ============================================================================
// Diabetes Knowledge Service (Server-side Only)
// Curated Bilingual Educational Articles & MedlinePlus / USDA Orchestration
// ============================================================================

import { HealthKnowledgeArticle, KnowledgeCategory } from '@/types';
import { searchMedlinePlus } from './medlinePlusService';
import { lookupMedicationEducation } from './medlineConnectService';

// ----------------------------------------------------------------------------
// Curated Peer-Reviewed Articles (Bilingual Khmer & English)
// Sources: National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK),
// MedlinePlus (NIH), and American Diabetes Association (ADA).
// ----------------------------------------------------------------------------

export const CURATED_ARTICLES: HealthKnowledgeArticle[] = [
  // 1. Understanding Diabetes
  {
    id: 'understanding-type-2',
    category: 'understanding',
    title: 'Understanding Type 2 Diabetes & Insulin Resistance',
    titleKm: 'ស្វែងយល់អំពីជំងឺទឹកនោមផ្អែមប្រភេទទី ២ និងភាពធន់នឹងអាំងស៊ុយលីន',
    summary:
      'Type 2 diabetes occurs when body cells do not respond normally to insulin (insulin resistance). Learn how insulin regulates blood sugar and key risk factors.',
    summaryKm:
      'ជំងឺទឹកនោមផ្អែមប្រភេទទី ២ កើតឡើងនៅពេលកោសិការាងកាយមិនឆ្លើយតបធម្មតាទៅនឹងអាំងស៊ុយលីន (ភាពធន់នឹងអាំងស៊ុយលីន) ស្វែងយល់ពីរបៀបដែលអាំងស៊ុយលីនគ្រប់គ្រងជាតិស្ករ',
    contentHtml: `
      <h3>What is Type 2 Diabetes?</h3>
      <p>Type 2 diabetes is a chronic condition that affects the way your body processes blood sugar (glucose). With type 2 diabetes, your pancreas still produces insulin, but your cells become resistant to its effects. Consequently, glucose builds up in your bloodstream instead of being used for cell energy.</p>
      <h4>Common Symptoms:</h4>
      <ul>
        <li>Increased thirst and frequent urination (especially at night)</li>
        <li>Unexplained fatigue or feeling tired after meals</li>
        <li>Blurry vision and slow-healing cuts or bruises</li>
        <li>Tingling or numbness in hands or feet</li>
      </ul>
      <h4>Core Management Pillars:</h4>
      <p>Lifestyle balance (nutrition awareness and daily walking), taking oral medications exactly as prescribed, and regular blood glucose tracking form the foundation of effective diabetes management.</p>
    `,
    contentKm: `
      <h3>តើអ្វីជាជំងឺទឹកនោមផ្អែមប្រភេទទី ២?</h3>
      <p>ជំងឺទឹកនោមផ្អែមប្រភេទទី ២ គឺជាស្ថានភាពរ៉ាំរ៉ៃដែលប៉ះពាល់ដល់ដំណើរការស្រូបយកជាតិស្ករ (គ្លុយកូស) ក្នុងរាងកាយ ក្នុងប្រភេទនេះ លំពែងនៅតែផលិតអាំងស៊ុយលីនបាន ប៉ុន្តែកោសិកាមិនឆ្លើយតបល្អ (ភាពធន់នឹងអាំងស៊ុយលីន) ធ្វើឱ្យជាតិស្ករកើនឡើងក្នុងឈាម</p>
      <h4>រោគសញ្ញាសំខាន់ៗ៖</h4>
      <ul>
        <li>ស្រេកទឹកញឹកញាប់ និងនោមច្រើនដង (ជាពិសេសពេលយប់)</li>
        <li>អស់កម្លាំងល្ហិតល្ហៃ ឬងងុយគេងខ្លាំងក្រោយបាយ</li>
        <li>ស្រវាំងភ្នែក ឬរបួសក្រសះស្បើយ</li>
        <li>ស្ពឹក ឬស្រពន់នៅចុងដៃចុងជើង</li>
      </ul>
      <h4>សសរស្តម្ភនៃការគ្រប់គ្រង៖</h4>
      <p>ការគ្រប់គ្រងរបបអាហារ ការដើរហាត់ប្រាណប្រចាំថ្ងៃ ការលេបថ្នាំទៀងទាត់តាមវេជ្ជបញ្ជា និងការតាមដានកម្រិតជាតិស្ករជាប្រចាំ គឺជាគន្លឹះចម្បងក្នុងការថែទាំសុខភាព</p>
    `,
    sourceName: 'National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)',
    sourceUrl: 'https://medlineplus.gov/diabetestype2.html',
    lastReviewed: '2026-03-15',
    clinicalCode: 'E11.9',
    tags: ['Type 2 Diabetes', 'Insulin', 'Elderly Care', 'NIH'],
    isCurated: true
  },

  // 2. Testing Guide
  {
    id: 'glucose-testing-routine',
    category: 'testing_guide',
    title: 'How to Test Blood Glucose Correctly: Step-by-Step Guide',
    titleKm: 'របៀបវាស់កម្រិតជាតិស្ករឱ្យបានត្រឹមត្រូវ៖ ការណែនាំមួយជំហានម្តងៗ',
    summary:
      'Learn proper handwashing, lancet technique, meter preparation, and why recording the measurement context (fasting, post-meal) is crucial for family tracking.',
    summaryKm:
      'ស្វែងយល់ពីការលាងសម្អាតដៃ បច្ចេកទេសប្រើម្ជុលចាក់ ម៉ាស៊ីនវាស់ និងមូលហេតុដែលត្រូវកត់ត្រាពេលវេលាវាស់ (មុនបាយ ឬក្រោយបាយ) ឱ្យបានច្បាស់លាស់',
    contentHtml: `
      <h3>Step-by-Step Blood Glucose Measurement</h3>
      <ol>
        <li><strong>Wash Hands:</strong> Wash with warm, soapy water and dry thoroughly with a clean towel. Avoid alcohol wipes with sugar residue or hand lotions.</li>
        <li><strong>Prepare the Meter:</strong> Insert a fresh test strip into your blood glucose monitor. Ensure the code matches if calibration is required.</li>
        <li><strong>Lancet Prick:</strong> Prick the side of your fingertip (less sensitive than the pad). Use a fresh lancet for each test.</li>
        <li><strong>Apply Blood:</strong> Touch the edge of the test strip to the blood drop until the capillary tube fills. Wait 5 seconds for the reading.</li>
        <li><strong>Record Immediately:</strong> Log the numerical reading (in mg/dL) along with the measurement context (Fasting, 2 hours post-meal, or bedtime).</li>
      </ol>
      <div class="note">
        <strong>Important Tip:</strong> Never squeeze the fingertip forcefully, as interstitial fluid can dilute the blood sample and result in a falsely low reading.
      </div>
    `,
    contentKm: `
      <h3>ជំហានវាស់ជាតិស្ករក្នុងឈាម</h3>
      <ol>
        <li><strong>លាងសម្អាតដៃ៖</strong> លាងដៃជាមួយទឹកក្ដៅឧណ្ហៗ និងសាប៊ូ រួចជូតឱ្យស្ងួតស្អាត ចៀសវាងលាបឡេមុនពេលវាស់</li>
        <li><strong>រៀបចំម៉ាស៊ីន៖</strong> ដាក់បន្ទះតេស្តចូលក្នុងម៉ាស៊ីនវាស់ជាតិស្ករឱ្យត្រឹមត្រូវ</li>
        <li><strong>ចាក់យកឈាម៖</strong> ចាក់នៅគែមចំហៀងចុងម្រាមដៃ (ឈឺតិចជាងកណ្តាលម្រាម) ដោយប្រើម្ជុលស្អាតថ្មីជានិច្ច</li>
        <li><strong>ដាក់ឈាមលើបន្ទះ៖</strong> យកគែមបន្ទះតេស្តទៅផ្អឹបនឹងតំណក់ឈាម រួចរង់ចាំប្រហែល ៥ វិនាទី</li>
        <li><strong>កត់ត្រាភ្លាមៗ៖</strong> កត់ត្រាលេខ (គិតជា mg/dL) ព្រមទាំងពេលវេលាវាស់ (មុនបាយ ឬក្រោយបាយ ២ ម៉ោង)</li>
      </ol>
      <div class="note">
        <strong>ការណែនាំសំខាន់៖</strong> កុំច្របាច់ចុងម្រាមដៃខ្លាំងពេក ព្រោះទឹកថ្លាក្នុងជាលិកាអាចលាយជាមួយឈាម ធ្វើឱ្យលទ្ធផលជាតិស្ករទាបជាងការពិត
      </div>
    `,
    sourceName: 'Centers for Disease Control and Prevention (CDC) & MedlinePlus',
    sourceUrl: 'https://medlineplus.gov/bloodsugar.html',
    lastReviewed: '2026-02-10',
    tags: ['Blood Glucose Monitoring', 'Glucometer', 'Testing Guide', 'CDC'],
    isCurated: true
  },

  // 3. Glucose Levels & HbA1c
  {
    id: 'understanding-glucose-hba1c',
    category: 'glucose_hba1c',
    title: 'Blood Glucose Ranges and Understanding the HbA1c Test',
    titleKm: 'កម្រិតជាតិស្ករគោលដៅ និងស្វែងយល់អំពីតេស្តអេម៉ូក្លូប៊ីន HbA1c',
    summary:
      'Educational guide on fasting vs post-meal glucose targets, how HbA1c reflects 2–3 month blood sugar control, and why targets must be clinician-individualized.',
    summaryKm:
      'ការណែនាំអំពីកម្រិតជាតិស្ករមុន និងក្រោយអាហារ របៀបដែលតេស្ត HbA1c បង្ហាញពីការគ្រប់គ្រងជាតិស្ករក្នុងរយៈពេល ២-៣ ខែ និងសារៈសំខាន់នៃការកំណត់គោលដៅដោយគ្រូពេទ្យ',
    contentHtml: `
      <h3>General Educational Reference Targets (ADA Guidelines)</h3>
      <ul>
        <li><strong>Fasting / Pre-meal Glucose:</strong> 80–130 mg/dL</li>
        <li><strong>1–2 Hours After Beginning a Meal:</strong> Less than 180 mg/dL</li>
        <li><strong>Bedtime Glucose:</strong> 100–140 mg/dL</li>
      </ul>
      <p><em>*Note: These are general reference values. Individual targets must be set by Mom's attending physician based on her age, diabetes duration, and overall health.</em></p>
      <h3>What is the HbA1c Test?</h3>
      <p>The Hemoglobin A1c (HbA1c) test measures the percentage of your red blood cells with glucose-coated hemoglobin. Because red blood cells live for about 3 months, HbA1c reflects your average blood sugar over the preceding 8–12 weeks. An A1c of less than 7.0% is a common general target for many non-pregnant adults with diabetes.</p>
    `,
    contentKm: `
      <h3>កម្រិតគោលដៅទូទៅសម្រាប់ជាឯកសារយោង (ADA)</h3>
      <ul>
        <li><strong>ជាតិស្ករពេលព្រឹកព្រលឹម / មុនបាយ៖</strong> ៨០ ដល់ ១៣០ mg/dL</li>
        <li><strong>១ ដល់ ២ ម៉ោងក្រោយពេលបាយ៖</strong> ក្រោម ១៨០ mg/dL</li>
        <li><strong>មុនពេលចូលគេង៖</strong> ១០០ ដល់ ១៤០ mg/dL</li>
      </ul>
      <p><em>*ចំណាំ៖ នេះជាកម្រិតយោងអប់រំទូទៅប៉ុណ្ណោះ កម្រិតគោលដៅពិតប្រាកដសម្រាប់អ្នកម្តាយ ត្រូវកំណត់ដោយវេជ្ជបណ្ឌិតផ្ទាល់</em></p>
      <h3>តើអ្វីជាតេស្ត HbA1c?</h3>
      <p>តេស្ត HbA1c គឺជាការវាស់ស្ទង់ជាតិស្ករដែលតោងជាប់នឹងគ្រាប់ឈាមក្រហម ដោយសារគ្រាប់ឈាមក្រហមរស់នៅបានប្រហែល ៣ ខែ តេស្តនេះបង្ហាញពីមធ្យមភាគជាតិស្ករក្នុងរយៈពេល ៨-១២ សប្តាហ៍កន្លងមក កម្រិត HbA1c ក្រោម 7.0% គឺជាគោលដៅទូទៅសម្រាប់មនុស្សពេញវ័យភាគច្រើន</p>
    `,
    sourceName: 'American Diabetes Association (ADA) Standards of Care',
    sourceUrl: 'https://medlineplus.gov/a1c.html',
    lastReviewed: '2026-01-20',
    clinicalCode: '4548-4',
    tags: ['HbA1c', 'Glucose Ranges', 'Fasting Glucose', 'ADA'],
    isCurated: true
  },

  // 4. Hypoglycemia & Hyperglycemia
  {
    id: 'hypo-and-hyperglycemia-management',
    category: 'hypo_hyper',
    title: 'Recognizing & Managing Low Blood Sugar (15-15 Rule) and High Blood Sugar',
    titleKm: 'ការសម្គាល់ និងសង្គ្រោះជាតិស្ករចុះទាប (ច្បាប់ ១៥-១៥) និងជាតិស្ករឡើងខ្ពស់',
    summary:
      'Learn the critical signs of hypoglycemia (< 70 mg/dL), the emergency 15-15 rule for conscious seniors, unconscious emergency protocols, and high sugar symptoms.',
    summaryKm:
      'ស្វែងយល់ពីរោគសញ្ញាជាតិស្ករធ្លាក់ចុះ (< 70 mg/dL) គោលការណ៍សង្គ្រោះបន្ទាន់ ១៥-១៥ វិធានការពេលសន្លប់ និងរោគសញ្ញាជាតិស្ករឡើងខ្ពស់',
    contentHtml: `
      <h3>Hypoglycemia (Low Blood Sugar: &lt; 70 mg/dL)</h3>
      <h4>Common Symptoms:</h4>
      <p>Shakiness, sweating, dizziness, sudden rapid heartbeat, pale skin, confusion, or sudden extreme hunger.</p>
      <h4>The 15-15 Rule for CONSCIOUS Patients:</h4>
      <ol>
        <li>Consume 15 grams of fast-acting carbohydrate: 1/2 cup fruit juice, 1/2 can regular soda (not diet), or 3–4 glucose tablets.</li>
        <li>Wait 15 minutes and rest quietly.</li>
        <li>Check blood sugar again. If still under 70 mg/dL, repeat with another 15 grams.</li>
      </ol>
      <div class="danger">
        <strong>CRITICAL SAFETY RULE:</strong> If the patient is UNCONSCIOUS or unable to swallow, NEVER put food or drink into their mouth! Position on their side and call emergency services (119) immediately.
      </div>
      <h3>Hyperglycemia (High Blood Sugar)</h3>
      <p>Frequent urination, extreme thirst, headache, and fatigue. Ensure hydration with plain water. Never administer extra medication to force glucose down without physician instruction.</p>
    `,
    contentKm: `
      <h3>ជាតិស្ករចុះទាប (Hypoglycemia: &lt; 70 mg/dL)</h3>
      <h4>រោគសញ្ញាសម្គាល់៖</h4>
      <p>ញ័រដៃជើង បែកញើសត្រជាក់ វិលមុខ បេះដូងលោតញាប់ ស្លេកស្លាំង វង្វេងវង្វាន់ ឬឃ្លានខ្លាំងភ្លាមៗ</p>
      <h4>គោលការណ៍ ១៥-១៥ សម្រាប់អ្នកជំងឺដែលនៅដឹងខ្លួន៖</h4>
      <ol>
        <li>ពិសារជាតិស្ករស្រូបលឿន ១៥ ក្រាមជាបន្ទាន់៖ ទឹកផ្លែឈើកន្លះកែវ ឬស្ករ ៣-៤ ស្លាបព្រា</li>
        <li>សម្រាកស្ងប់ស្ងាត់រយៈពេល ១៥ នាទី</li>
        <li>វាស់ជាតិស្ករឡើងវិញ ប្រសិនបើនៅក្រោម ៧០ mg/dL សូមបន្តពិសារ ១៥ ក្រាមទៀត</li>
      </ol>
      <div class="danger">
        <strong>វិធានការសង្គ្រោះអាសន្ន៖</strong> ប្រសិនបើអ្នកជំងឺសន្លប់ ឬលេបមិនរួច កុំបញ្ចុកអាហារ ឬទឹកតាមមាត់ជាដាច់ខាត! សូមទូរស័ព្ទហៅសង្គ្រោះបន្ទាន់ (១១៩) ភ្លាមៗ!
      </div>
      <h3>ជាតិស្ករឡើងខ្ពស់ (Hyperglycemia)</h3>
      <p>នោមញឹកញាប់ ស្រេកទឹកខ្លាំង ឈឺក្បាល និងអស់កម្លាំង សូមពិសារទឹកស្អាតឱ្យបានច្រើន និងកុំបន្ថែមថ្នាំដោយគ្មានការណែនាំពីគ្រូពេទ្យ</p>
    `,
    sourceName: 'MedlinePlus & American Association of Diabetes Educators',
    sourceUrl: 'https://medlineplus.gov/hypoglycemia.html',
    lastReviewed: '2026-03-01',
    clinicalCode: 'E16.2',
    tags: ['Hypoglycemia', '15-15 Rule', 'Emergency', 'Hyperglycemia'],
    isCurated: true
  },

  // 5. Medication Education
  {
    id: 'oral-diabetes-medications-guide',
    category: 'medications',
    title: 'Oral Diabetes Medications: Metformin & How They Work',
    titleKm: 'ថ្នាំលេបទឹកនោមផ្អែម៖ ស្វែងយល់អំពីថ្នាំ Metformin និងរបៀបដែលថ្នាំដំណើរការ',
    summary:
      'Overview of Metformin and oral diabetes medications, instructions on taking with meals to prevent stomach upset, and adherence safety rules.',
    summaryKm:
      'ព័ត៌មានទូទៅអំពីថ្នាំ Metformin និងថ្នាំលេបដទៃទៀត ការណែនាំលេបជាមួយអាហារដើម្បីការពារការរមួលក្រពះ និងវិន័យលេបថ្នាំឱ្យបានទៀងទាត់',
    contentHtml: `
      <h3>How Oral Diabetes Medications Work</h3>
      <p>Oral medications work through various mechanisms to assist your body in managing blood glucose:</p>
      <ul>
        <li><strong>Biguanides (e.g. Metformin):</strong> Lowers glucose production by the liver and improves muscle sensitivity to insulin. Commonly taken with or immediately after meals to reduce stomach discomfort.</li>
        <li><strong>Sulfonylureas (e.g. Gliclazide, Glipizide):</strong> Stimulates the pancreas to produce more insulin. Must be taken with meals to prevent hypoglycemia.</li>
        <li><strong>DPP-4 Inhibitors (e.g. Sitagliptin):</strong> Helps the body release more insulin only when blood sugar rises after eating.</li>
      </ul>
      <div class="safety">
        <strong>Adherence Safety:</strong> Always take prescribed doses at the scheduled time. Never skip meals when taking medications that can lower blood sugar, and never double a dose if one was missed.
      </div>
    `,
    contentKm: `
      <h3>របៀបដែលថ្នាំលេបដំណើរការ</h3>
      <p>ថ្នាំលេបនីមួយៗមានតួនាទីជួយរាងកាយគ្រប់គ្រងជាតិស្ករតាមវិធីផ្សេងៗគ្នា៖</p>
      <ul>
        <li><strong>Metformin (ក្រុម Biguanides)៖</strong> កាត់បន្ថយការផលិតជាតិស្ករពីថ្លើម និងបង្កើនការឆ្លើយតបរបស់កោសិកា គួរលេបជាមួយ ឬភ្លាមៗក្រោយបាយ ដើម្បីកុំឱ្យរមួលក្រពះ</li>
        <li><strong>Gliclazide / Glipizide (ក្រុម Sulfonylureas)៖</strong> ជួយជំរុញលំពែងឱ្យបញ្ចេញអាំងស៊ុយលីនបន្ថែម ត្រូវលេបជាមួយអាហារដើម្បីការពារកុំឱ្យជាតិស្ករចុះទាបពេក</li>
        <li><strong>Sitagliptin (ក្រុម DPP-4)៖</strong> ជួយបញ្ចេញអាំងស៊ុយលីននៅពេលជាតិស្ករឡើងខ្ពស់ក្រោយពេលបាយ</li>
      </ul>
      <div class="safety">
        <strong>សុវត្ថិភាពថ្នាំ៖</strong> ត្រូវលេបថ្នាំទៀងទាត់តាមវេជ្ជបញ្ជា កុំបង្អត់អាហារនៅពេលលេបថ្នាំ ហើយកុំលេបថ្នាំទ្វេដងនៅពេលភ្លេចលេបកាលពីពេលមុន
      </div>
    `,
    sourceName: 'MedlinePlus Drug Information & NLM Connect',
    sourceUrl: 'https://medlineplus.gov/druginfo/meds/a696005.html',
    lastReviewed: '2026-02-15',
    clinicalCode: '860975',
    tags: ['Metformin', 'Oral Medications', 'Prescription', 'Drug Safety'],
    isCurated: true
  },

  // 6. Healthy Eating & Cambodian Nutrition
  {
    id: 'cambodian-diabetes-nutrition-guide',
    category: 'nutrition',
    title: 'Healthy Eating & Carbohydrate Awareness in Cambodian Diets',
    titleKm: 'អាហារូបត្ថម្ភ និងការយល់ដឹងពីកាបូអ៊ីដ្រាតក្នុងរបបអាហារខ្មែរ',
    summary:
      'Practical tips for balancing white rice portions, incorporating non-starchy local vegetables, fish and tofu protein, and choosing water over sweetened drinks.',
    summaryKm:
      'គន្លឹះជាក់ស្តែងក្នុងការវាស់កម្រិតបាយស បន្ថែមបន្លែស្លឹកបៃតងក្នុងស្រុក ប្រភពប្រូតេអ៊ីនពីត្រី និងតៅហ៊ូ ព្រមទាំងការពិសារទឹកជំនួសភេសជ្ជៈផ្អែម',
    contentHtml: `
      <h3>The Balanced Plate Method</h3>
      <p>A simple visual guide for preparing meals for seniors with diabetes:</p>
      <ul>
        <li><strong>1/2 Plate - Non-starchy Vegetables:</strong> Water spinach (Trokoun), morning glory, cabbage, cucumber, wax gourd (Trolach), and bitter melon (Mras).</li>
        <li><strong>1/4 Plate - Lean Protein:</strong> Fresh freshwater fish (Trey Roh, Trey Chhpin), skinless chicken, tofu, and boiled eggs.</li>
        <li><strong>1/4 Plate - Quality Carbohydrates:</strong> Controlled portions of rice (prefer brown rice or jasmine rice measured to 1 small bowl), sweet potato, or whole grains.</li>
      </ul>
      <h4>Smart Beverage Choices:</h4>
      <p>Plain water, unsweetened green tea, or warm lemon water. Limit sugary condensed milk iced coffee (Kafe Teuk Doh Kou), sweet fruit shakes, and energy drinks.</p>
    `,
    contentKm: `
      <h3>រូបមន្តចានបាយសុខភាព</h3>
      <p>ការបែងចែកចានអាហារឱ្យមានតុល្យភាពសម្រាប់មនុស្សចាស់៖</p>
      <ul>
        <li><strong>ពាក់កណ្តាលចាន (១/២) - បន្លែគ្មានម្សៅ៖</strong> ត្រកួន ផ្កាខាត់ណា ស្ពៃក្តោប ត្រសក់ ត្រឡាច និងម្រះ</li>
        <li><strong>មួយភាគបួនចាន (១/៤) - ប្រូតេអ៊ីនល្អ៖</strong> ត្រីស្រស់ (ត្រីរ៉ស់ ត្រីឆ្ពិន) សាច់មាន់គ្មានស្បែក តៅហ៊ូ និងស៊ុតស្ងោរ</li>
        <li><strong>មួយភាគបួនចាន (១/៤) - កាបូអ៊ីដ្រាត៖</strong> កម្រិតបាយឱ្យល្មម (ប្រហែល ១ ចានចង្កឹះតូច ឬបាយសម្រូប) ដំឡូងជ្វា ឬគ្រាប់ធញ្ញជាតិ</li>
      </ul>
      <h4>ការជ្រើសរើសភេសជ្ជៈ៖</h4>
      <p>ពិសារទឹកស្អាត ឬតែបៃតងគ្មានជាតិស្ករ កាត់បន្ថយការទទួលទានកាហ្វេទឹកដោះគោផ្អែមខ្លាំង ទឹកផ្លែឈើក្រឡុកបន្ថែមស្ករ និងភេសជ្ជៈប៉ូវកម្លាំង</p>
    `,
    sourceName: 'USDA FoodData Central & Cambodian Nutrition Guidelines',
    sourceUrl: 'https://fdc.nal.usda.gov/',
    lastReviewed: '2026-03-05',
    tags: ['Nutrition', 'Cambodian Diet', 'Carbohydrates', 'Plate Method'],
    isCurated: true
  }
];

/**
 * Get all curated educational articles
 */
export function getCuratedArticles(category?: KnowledgeCategory): HealthKnowledgeArticle[] {
  if (category) {
    return CURATED_ARTICLES.filter((a) => a.category === category);
  }
  return CURATED_ARTICLES;
}

/**
 * Get single article by ID
 */
export async function getArticleById(id: string): Promise<HealthKnowledgeArticle | null> {
  const curated = CURATED_ARTICLES.find((a) => a.id === id);
  if (curated) return curated;

  // If not curated, try fetching via MedlinePlus or MedlinePlus Connect
  if (id.startsWith('mlp-')) {
    const rawTerm = id.replace('mlp-', '');
    const searchRes = await searchMedlinePlus(rawTerm, 1);
    if (searchRes.length > 0) return searchRes[0];
  }

  return null;
}

/**
 * Searches across curated articles and official MedlinePlus Web Service
 */
export async function searchHealthKnowledge(query: string): Promise<HealthKnowledgeArticle[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return CURATED_ARTICLES;

  // 1. Search in curated bilingual articles first
  const curatedMatches = CURATED_ARTICLES.filter((article) => {
    return (
      article.title.toLowerCase().includes(normalized) ||
      article.titleKm.toLowerCase().includes(normalized) ||
      article.summary.toLowerCase().includes(normalized) ||
      article.summaryKm.toLowerCase().includes(normalized) ||
      article.tags?.some((t) => t.toLowerCase().includes(normalized))
    );
  });

  // 2. Query official MedlinePlus Web Service for external authoritative depth
  let externalMatches: HealthKnowledgeArticle[] = [];
  try {
    externalMatches = await searchMedlinePlus(normalized, 6);
  } catch (err) {
    console.warn('MedlinePlus search error:', err);
  }

  // Deduplicate results
  const seenUrls = new Set<string>();
  const combined: HealthKnowledgeArticle[] = [];

  for (const item of [...curatedMatches, ...externalMatches]) {
    if (!seenUrls.has(item.sourceUrl)) {
      seenUrls.add(item.sourceUrl);
      combined.push(item);
    }
  }

  return combined;
}

