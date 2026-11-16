'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import {
  Droplet,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface TestingGuideViewProps {
  onOpenArticleModal?: (articleId: string) => void;
}

export function TestingGuideView({ onOpenArticleModal }: TestingGuideViewProps) {
  const locale = useLocale();

  const testingMoments = [
    {
      id: 'fasting',
      title: 'Fasting (Early Morning)',
      titleKm: 'ពេលព្រឹកព្រលឹម (អត់អាហារ ៨-១០ ម៉ោង)',
      timing: 'Immediately after waking, before breakfast or morning coffee',
      timingKm: 'ភ្លាមៗពេលភ្ញាក់ពីគេង មុនពិសារអាហារពេលព្រឹក ឬកាហ្វេ',
      educationalRange: '80–130 mg/dL (General educational target)',
      educationalRangeKm: '៨០–១៣០ mg/dL (កម្រិតគោលដៅយោងទូទៅ)',
      importance: 'Shows baseline liver glucose release during the night.',
      importanceKm: 'ឆ្លុះបញ្ចាំងពីកម្រិតជាតិស្ករមូលដ្ឋានដែលថ្លើមបញ្ចេញពេលយប់'
    },
    {
      id: 'before_meal',
      title: 'Before Meals (Pre-prandial)',
      titleKm: 'មុនពេលបាយ (Pre-meal)',
      timing: '15–30 minutes before lunch or dinner',
      timingKm: '១៥–៣០ នាទីមុនពិសារអាហារថ្ងៃត្រង់ ឬល្ងាច',
      educationalRange: '80–130 mg/dL',
      educationalRangeKm: '៨០–១៣០ mg/dL',
      importance: 'Provides baseline before carbohydrate intake.',
      importanceKm: 'ផ្តល់ទិន្នន័យដើមមុនពេលរាងកាយស្រូបកាបូអ៊ីដ្រាតពីអាហារ'
    },
    {
      id: 'post_meal',
      title: '1–2 Hours After Meals (Post-prandial)',
      titleKm: '១ ដល់ ២ ម៉ោងក្រោយពេលបាយ (Post-meal)',
      timing: 'Count 2 hours from the first bite of the meal',
      timingKm: 'រាប់ ២ ម៉ោងគិតចាប់ពីពេលចាប់ផ្តើមញ៉ាំបាយម៉ាត់ដំបូង',
      educationalRange: '< 180 mg/dL',
      educationalRangeKm: 'ក្រោម ១៨០ mg/dL',
      importance: 'Measures how effectively insulin clears mealtime carbohydrates.',
      importanceKm: 'បង្ហាញពីប្រសិទ្ធភាពនៃការគ្រប់គ្រងកាបូអ៊ីដ្រាតក្រោយពេលបាយ'
    },
    {
      id: 'bedtime',
      title: 'Bedtime',
      titleKm: 'មុនពេលចូលគេង (Bedtime)',
      timing: 'Before sleeping to prevent overnight hypoglycemia',
      timingKm: 'មុនពេលចូលគេង ដើម្បីការពារជាតិស្ករចុះទាបពេលយប់',
      educationalRange: '100–140 mg/dL',
      educationalRangeKm: '១០០–១៤០ mg/dL',
      importance: 'Ensures safe blood glucose levels throughout the sleep cycle.',
      importanceKm: 'ធានាសុវត្ថិភាពជាតិស្ករពេញមួយយប់ពេលសម្រាក'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Wash & Dry Hands',
      titleKm: 'លាងដៃ និងជូតឱ្យស្ងួត',
      desc: 'Use warm, soapy water. Do not use scented hand sanitizers or lotions with glycerin, which can distort meter readings.',
      descKm: 'លាងដៃជាមួយទឹកក្ដៅឧណ្ហៗ និងសាប៊ូ រួចជូតឱ្យស្ងួត កុំប្រើជែលលាងដៃដែលមានក្លិនក្រអូប ព្រោះជាតិស្ករក្នុងនោះអាចធ្វើឱ្យតួលេខខុស'
    },
    {
      step: '02',
      title: 'Prepare Lancet & Strip',
      titleKm: 'រៀបចំម្ជុល និងបន្ទះតេស្ត',
      desc: 'Insert a new test strip into the monitor. Always use a fresh, sterile lancet to minimize pain and prevent tissue damage.',
      descKm: 'ដាក់បន្ទះតេស្តថ្មីចូលក្នុងម៉ាស៊ីន ត្រូវប្តូរម្ជុលថ្មីជានិច្ច ដើម្បីកុំឱ្យឈឺ និងការពារការបង្ករោគ'
    },
    {
      step: '03',
      title: 'Prick the Side of the Finger',
      titleKm: 'ចាក់នៅគែមចំហៀងម្រាមដៃ',
      desc: 'Prick the side of your fingertip where there are fewer nerve endings. Alternate fingers daily to avoid calluses.',
      descKm: 'ចាក់នៅគែមចំហៀងចុងម្រាមដៃ (ឈឺតិចជាងកណ្តាលម្រាម) ប្តូរម្រាមដៃវាស់ជារៀងរាល់ថ្ងៃ'
    },
    {
      step: '04',
      title: 'Apply Blood & Record',
      titleKm: 'ដាក់ឈាមលើបន្ទះ និងកត់ត្រា',
      desc: 'Touch the strip edge to the drop of blood. Never squeeze the finger forcefully. Log the reading into Family Diabetes Care immediately.',
      descKm: 'ដាក់គែមបន្ទះតេស្តទៅផ្អឹបនឹងតំណក់ឈាម កុំច្របាច់ម្រាមដៃខ្លាំងពេក កត់ត្រាតួលេខ (mg/dL) ចូលក្នុងកម្មវិធីភ្លាមៗ'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30 mb-3">
            <Droplet className="w-3.5 h-3.5 mr-1 text-teal-300" />
            {locale === 'km' ? 'មគ្គុទ្ទេសក៍វាស់ជាតិស្ករ' : 'Testing Routine Guide'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-khmer tracking-tight">
            {locale === 'km'
              ? 'របៀបវាស់ជាតិស្ករក្នុងឈាមឱ្យបានត្រឹមត្រូវ'
              : 'How to Test Blood Glucose Correctly'}
          </h2>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-2 leading-relaxed font-khmer">
            {locale === 'km'
              ? 'ការវាស់ជាតិស្ករបានត្រឹមត្រូវជួយឱ្យគ្រួសារ និងគ្រូពេទ្យដឹងច្បាស់ពីការឆ្លើយតបរបស់រាងកាយចំពោះអាហារ និងថ្នាំលេប'
              : 'Accurate self-monitoring of blood glucose (SMBG) gives your family and physician reliable insights into how food and medication affect blood sugar.'}
          </p>
        </div>
      </div>

      {/* Measurement Moments Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900 font-khmer flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>
              {locale === 'km' ? 'ពេលវេលាដែលត្រូវវាស់ជាប្រចាំ' : 'When to Measure Blood Glucose'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-khmer mt-0.5">
            {locale === 'km'
              ? 'កុំច្របាច់បញ្ចូលគ្នានូវលទ្ធផលវាស់មុនបាយ និងក្រោយបាយ ព្រោះវាមានកម្រិតគោលដៅខុសគ្នា'
              : 'Never combine fasting and post-meal readings into one average because their metabolic targets are distinct.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testingMoments.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70 inline-block mb-1.5 font-khmer">
                    {locale === 'km' ? m.titleKm : m.title}
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1 font-khmer">
                    {locale === 'km' ? m.educationalRangeKm : m.educationalRange}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1.5 font-khmer">
                <p>
                  <strong>{locale === 'km' ? 'ពេលវាស់៖ ' : 'Timing: '}</strong>
                  {locale === 'km' ? m.timingKm : m.timing}
                </p>
                <p className="text-slate-500">
                  <strong>{locale === 'km' ? 'អត្ថប្រយោជន៍៖ ' : 'Clinical Value: '}</strong>
                  {locale === 'km' ? m.importanceKm : m.importance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Technique */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs">
        <h3 className="text-lg font-black text-slate-900 font-khmer mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{locale === 'km' ? '៤ ជំហាននៃការវាស់ជាតិស្ករ' : '4-Step Testing Technique'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st) => (
            <div
              key={st.step}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-teal-700">{st.step}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1 font-khmer">
                  {locale === 'km' ? st.titleKm : st.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-khmer">
                  {locale === 'km' ? st.descKm : st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Safety Disclaimer Callout */}
      <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl text-xs text-teal-950 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="font-khmer leading-relaxed">
          <strong>
            {locale === 'km'
              ? 'គោលដៅជាតិស្ករផ្ទាល់ខ្លួន៖ '
              : 'Individualized Target Notice: '}
          </strong>
          {locale === 'km'
            ? 'កម្រិត ៨០–១៣០ mg/dL (មុនបាយ) និងក្រោម ១៨០ mg/dL (ក្រោយបាយ) គឺជាកម្រិតយោងអប់រំប៉ុណ្ណោះ គ្រូពេទ្យប្រចាំកាយនឹងកំណត់គោលដៅជាក់លាក់សម្រាប់ម៉ាក់នៅក្នុងទំព័រ «គោលដៅជាតិស្ករ»'
            : 'Reference ranges of 80–130 mg/dL (pre-meal) and below 180 mg/dL (post-meal) are educational guidelines only. Always adhere to Mom\'s personalized targets configured by her attending doctor.'}
        </div>
      </div>
    </div>
  );
}

