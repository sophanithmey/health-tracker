// ============================================================================
// Telegram Inbound Webhook Service (សេវាទទួល និងកត់ត្រាជាតិស្ករតាមតេឡេក្រាម)
// Two-Way Interactive Telegram Bot Logging for Family Diabetes Care
// ============================================================================

import { MeasurementType, PatientProfile, GlucoseRecord, GlucoseTarget } from '@/types';
import { HealthRepository } from '../db/repository';
import { GlucoseTargetService } from './glucoseTargetService';
import { TelegramService } from './telegramService';

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number | string;
  type?: string;
  title?: string;
  username?: string;
  first_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface ParsedTelegramInput {
  isCommand: boolean;
  command?: string;
  commandArgs?: string[];
  isGlucoseReading: boolean;
  valueMgDl?: number;
  originalValue?: number;
  originalUnit?: 'mg/dL' | 'mmol/L';
  measurementType?: MeasurementType;
  isInferredType?: boolean;
  validationError?: string;
  validationErrorKm?: string;
}

export class TelegramInboundService {
  /**
   * Convert Khmer digits (០-៩) to Western Arabic digits (0-9)
   */
  public static normalizeKhmerNumerals(text: string): string {
    const khmerDigits: Record<string, string> = {
      '០': '0',
      '១': '1',
      '២': '2',
      '៣': '3',
      '៤': '4',
      '៥': '5',
      '៦': '6',
      '៧': '7',
      '៨': '8',
      '៩': '9'
    };
    return text.replace(/[០-៩]/g, (char) => khmerDigits[char] || char);
  }

  /**
   * Determine default measurement type based on current Phnom Penh time (UTC+7)
   */
  public static inferMeasurementTypeFromTime(date: Date = new Date()): MeasurementType {
    // Convert to Phnom Penh local time (UTC+7)
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const khmerTime = new Date(utcTime + 7 * 3600000);
    const hour = khmerTime.getHours();

    if (hour >= 5 && hour < 11) {
      return 'fasting'; // Morning / Breakfast
    } else if (hour >= 11 && hour < 14) {
      return '2h_after_meal'; // Lunch post-meal
    } else if (hour >= 14 && hour < 18) {
      return 'random'; // Afternoon casual
    } else if (hour >= 18 && hour < 21) {
      return '2h_after_meal'; // Dinner post-meal
    } else {
      return 'bedtime'; // Night / Bedtime (21:00 - 04:59)
    }
  }

  /**
   * Parse inbound text into commands or blood glucose readings
   */
  public static parseGlucoseInput(rawText: string, clientDate?: Date): ParsedTelegramInput {
    if (!rawText || typeof rawText !== 'string') {
      return { isCommand: false, isGlucoseReading: false };
    }

    const trimmed = rawText.trim();

    // 1. Check for Bot Commands (e.g. /start, /help, /today, /latest, /targets, /meds)
    if (trimmed.startsWith('/')) {
      const parts = trimmed.slice(1).split(/\s+/);
      const command = (parts[0] || '').toLowerCase().replace(/@\w+$/, ''); // Strip bot username if in group
      return {
        isCommand: true,
        command,
        commandArgs: parts.slice(1),
        isGlucoseReading: false
      };
    }

    // 2. Normalize Khmer numerals to standard 0-9
    const normalized = this.normalizeKhmerNumerals(trimmed).toLowerCase();

    // 3. Extract Blood Glucose Value
    // Look for numbers like 148, 148.5, 95 mg/dl, 7.8 mmol/L
    // Regex matches numbers with optional decimal point and optional unit
    const numberMatch = normalized.match(/(?:^|[^\w.])(\d{1,3}(?:\.\d+)?)\s*(mg\/?dl|mmol\/?l)?/i);

    if (!numberMatch) {
      return { isCommand: false, isGlucoseReading: false };
    }

    const rawNum = parseFloat(numberMatch[1]);
    const detectedUnit = numberMatch[2]?.toLowerCase();

    let valueMgDl: number;
    let originalUnit: 'mg/dL' | 'mmol/L' = 'mg/dL';

    // Unit conversion: If user wrote mmol/L or entered a typical mmol value (e.g., 4.0 - 15.0) with mmol unit
    if (detectedUnit?.includes('mmol') || (rawNum < 20 && rawNum >= 2.0 && detectedUnit)) {
      valueMgDl = Math.round(rawNum * 18.0182);
      originalUnit = 'mmol/L';
    } else {
      valueMgDl = Math.round(rawNum);
      originalUnit = 'mg/dL';
    }

    // 4. Clinical Safety Boundaries
    // Hypoglycemia / Hyperglycemia extreme bounds check
    if (valueMgDl < 20) {
      return {
        isCommand: false,
        isGlucoseReading: true,
        valueMgDl,
        originalValue: rawNum,
        originalUnit,
        validationError: 'Invalid reading: Blood glucose must be at least 20 mg/dL.',
        validationErrorKm:
          'តម្លៃជាតិស្ករមិនត្រឹមត្រូវ៖ ជាតិស្ករត្រូវតែយ៉ាងហោចណាស់ 20 mg/dL។ សូមពិនិត្យឧបករណ៍វាស់ជាតិស្កររបស់អ្នកឡើងវិញ។'
      };
    }

    if (valueMgDl > 600) {
      return {
        isCommand: false,
        isGlucoseReading: true,
        valueMgDl,
        originalValue: rawNum,
        originalUnit,
        validationError:
          'Critical: Reading exceeds standard meter limits (> 600 mg/dL). If meter displays "HI", seek emergency medical care immediately.',
        validationErrorKm:
          'អាសន្នធ្ងន់ធ្ងរ៖ តម្លៃជាតិស្ករខ្ពស់ហួសកម្រិតម៉ាស៊ីន (លើសពី 600 mg/dL)! ប្រសិនបើម៉ាស៊ីនបង្ហាញពាក្យ «HI» សូមប្រញាប់បញ្ជូនអ្នកជំងឺទៅមន្ទីរពេទ្យ ឬទាក់ទង 119 ជាបន្ទាន់!'
      };
    }

    // 5. Detect Measurement Type from context keywords
    let measurementType: MeasurementType | undefined;

    // Check 1h after meal first
    if (
      normalized.includes('1h') ||
      normalized.includes('1 hour') ||
      normalized.includes('1 hr') ||
      normalized.includes('1ម៉ោង') ||
      normalized.includes('1 ម៉ោង') ||
      normalized.includes('១ម៉ោង') ||
      normalized.includes('១ ម៉ោង')
    ) {
      measurementType = '1h_after_meal';
    }
    // Check 2h after meal / postmeal
    else if (
      normalized.includes('2h') ||
      normalized.includes('2 hour') ||
      normalized.includes('2 hrs') ||
      normalized.includes('2ម៉ោង') ||
      normalized.includes('2 ម៉ោង') ||
      normalized.includes('២ម៉ោង') ||
      normalized.includes('២ ម៉ោង') ||
      normalized.includes('after meal') ||
      normalized.includes('postmeal') ||
      normalized.includes('post-meal') ||
      normalized.includes('after lunch') ||
      normalized.includes('after dinner') ||
      normalized.includes('after breakfast') ||
      normalized.includes('ក្រោយបាយ') ||
      normalized.includes('ក្រោយអាហារ') ||
      normalized.includes('ក្រោយញ៉ាំបាយ')
    ) {
      measurementType = '2h_after_meal';
    }
    // Check Fasting / Morning
    else if (
      normalized.includes('fasting') ||
      normalized.includes('fast') ||
      /\bf\b/.test(normalized) ||
      normalized.includes('morning') ||
      normalized.includes('before breakfast') ||
      normalized.includes('waking') ||
      normalized.includes('មុនអាហារពេលព្រឹក') ||
      normalized.includes('មុនអាហារ') ||
      normalized.includes('មុនបាយ') ||
      normalized.includes('ពេលព្រឹក') ||
      normalized.includes('ព្រឹក') ||
      normalized.includes('អត់បាយ') ||
      normalized.includes('បង្អត់អាហារ')
    ) {
      measurementType = 'fasting';
    }
    // Check Before meal / Premeal
    else if (
      normalized.includes('before meal') ||
      normalized.includes('before lunch') ||
      normalized.includes('before dinner') ||
      normalized.includes('premeal') ||
      normalized.includes('pre-meal') ||
      normalized.includes('មុនពេលបាយ') ||
      normalized.includes('មុនអាហារថ្ងៃត្រង់') ||
      normalized.includes('មុនពេលញ៉ាំ') ||
      normalized.includes('មុនពេលអាហារ')
    ) {
      measurementType = 'before_meal';
    }
    // Check Bedtime / Night
    else if (
      normalized.includes('bedtime') ||
      normalized.includes('bed time') ||
      normalized.includes('night') ||
      normalized.includes('sleep') ||
      normalized.includes('before sleep') ||
      normalized.includes('before bed') ||
      normalized.includes('មុនគេង') ||
      normalized.includes('យប់') ||
      normalized.includes('ពេលយប់') ||
      normalized.includes('ចូលគេង') ||
      normalized.includes('មុនចូលគេង')
    ) {
      measurementType = 'bedtime';
    }
    // Check Random
    else if (
      normalized.includes('random') ||
      normalized.includes('casual') ||
      normalized.includes('anytime') ||
      normalized.includes('ចៃដន្យ') ||
      normalized.includes('ពេលណាក៏បាន')
    ) {
      measurementType = 'random';
    }

    let isInferredType = false;
    if (!measurementType) {
      measurementType = this.inferMeasurementTypeFromTime(clientDate || new Date());
      isInferredType = true;
    }

    return {
      isCommand: false,
      isGlucoseReading: true,
      valueMgDl,
      originalValue: rawNum,
      originalUnit,
      measurementType,
      isInferredType
    };
  }

  /**
   * Get bilingual label for measurement types
   */
  public static getMeasurementTypeLabels(type: MeasurementType): { en: string; km: string } {
    switch (type) {
      case 'fasting':
        return { en: 'Fasting (Morning)', km: 'មុនអាហារពេលព្រឹក (Fasting)' };
      case 'before_meal':
        return { en: 'Before Meal', km: 'មុនពេលអាហារ (Before Meal)' };
      case '1h_after_meal':
        return { en: '1h After Meal', km: '១ ម៉ោងក្រោយអាហារ (1h Post-meal)' };
      case '2h_after_meal':
        return { en: '2h After Meal', km: '២ ម៉ោងក្រោយអាហារ (2h Post-meal)' };
      case 'bedtime':
        return { en: 'Bedtime', km: 'មុនចូលគេង (Bedtime)' };
      case 'random':
        return { en: 'Random Glucose', km: 'ចៃដន្យ (Random)' };
      default:
        return { en: 'Other', km: 'ផ្សេងៗ (Other)' };
    }
  }

  /**
   * Handle incoming bot commands (/start, /help, /today, /latest, /targets, /meds)
   */
  public static async handleCommand(
    chatId: string | number,
    command: string,
    args: string[] = [],
    user?: TelegramUser
  ): Promise<string> {
    const patient = await HealthRepository.getPatientByTelegramChatId(chatId);

    switch (command) {
      case 'start':
      case 'help': {
        const patientName = patient.fullNameKm || patient.fullName;
        return (
          `🤖 <b>ជំនួយការថែទាំជាតិស្ករគ្រួសារ (Family Diabetes Care)</b>\n\n` +
          `សួស្តី${user?.first_name ? ' ' + TelegramService.escapeHtml(user.first_name) : ''}! ` +
          `ខ្ញុំជាជំនួយការកត់ត្រា និងតាមដានជាតិស្ករសម្រាប់ <b>${TelegramService.escapeHtml(patientName)}</b>។\n\n` +
          `📝 <b>របៀបកត់ត្រាជាតិស្ករ (How to log):</b>\n` +
          `គ្រាន់តែផ្ញើសារជាលេខ និងពេលវាស់ដូចខាងក្រោម៖\n` +
          `• <code>148 fasting</code> ឬ <code>១៤៨ មុនបាយ</code>\n` +
          `• <code>165 after lunch</code> ឬ <code>១៦៥ ក្រោយបាយ</code>\n` +
          `• <code>120 bedtime</code> ឬ <code>១២០ មុនគេង</code>\n` +
          `• ឬវាយតែលេខ <code>148</code> (ប្រព័ន្ធកំណត់ពេលស្វ័យប្រវត្តិ)\n\n` +
          `⚡ <b>ពាក្យបញ្ជាមានប្រយោជន៍ (Commands):</b>\n` +
          `• /latest ឬ /today — មើលជាតិស្ករចុងក្រោយ & សង្ខេបថ្ងៃនេះ\n` +
          `• /targets — មើលគោលដៅជាតិស្ករកំណត់ដោយគ្រូពេទ្យ\n` +
          `• /meds — មើលកាលវិភាគថ្នាំប្រចាំថ្ងៃរបស់ម៉ាក់\n` +
          `• /help — បង្ហាញសៀវភៅណែនាំនេះឡើងវិញ\n\n` +
          `— <i>Family Diabetes Care (ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ)</i>`
        );
      }

      case 'latest':
      case 'today': {
        const latest = await HealthRepository.getLatestGlucoseRecord(patient.id);
        const { records: todayRecords } = await HealthRepository.getGlucoseRecords({
          patientId: patient.id,
          startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          limit: 10
        });

        const patientName = patient.fullNameKm || patient.fullName;

        if (!latest && todayRecords.length === 0) {
          return (
            `📊 <b>សង្ខេបជាតិស្ករ (Glucose Status)</b>\n\n` +
            `👤 <b>អ្នកជំងឺ:</b> ${TelegramService.escapeHtml(patientName)}\n\n` +
            `ℹ️ មិនទាន់មានការកត់ត្រាជាតិស្ករនៅឡើយទេ។\n\n` +
            `👉 <i>ដើម្បីកត់ត្រា សូមវាយឧទាហរណ៍៖ <code>120 fasting</code> ឬ <code>១៤៨ មុនបាយ</code>។</i>`
          );
        }

        const typeLabels = latest
          ? this.getMeasurementTypeLabels(latest.measurementType)
          : { km: 'N/A', en: 'N/A' };

        let statusEmoji = '✅';
        let statusTextKm = 'ស្ថិតក្នុងគោលដៅល្អ';
        if (latest?.targetStatus === 'critical_low') {
          statusEmoji = '🚨';
          statusTextKm = 'ទាបកម្រិតគ្រោះថ្នាក់ (< 54 mg/dL)';
        } else if (latest?.targetStatus === 'low') {
          statusEmoji = '⚠️';
          statusTextKm = 'ទាបជាងគោលដៅ (< 70 mg/dL)';
        } else if (latest?.targetStatus === 'high') {
          statusEmoji = '⚠️';
          statusTextKm = 'លើសគោលដៅកំណត់';
        } else if (latest?.targetStatus === 'critical_high') {
          statusEmoji = '🚨';
          statusTextKm = 'ឡើងខ្ពស់កម្រិតអាសន្ន (> 250 mg/dL)';
        }

        const dateStr = latest
          ? new Date(latest.measuredAt).toLocaleTimeString('km-KH', {
              timeZone: 'Asia/Phnom_Penh',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : '';

        let response =
          `📊 <b>កម្រិតជាតិស្ករចុងក្រោយ (Latest Blood Glucose)</b>\n\n` +
          `👤 <b>អ្នកជំងឺ:</b> ${TelegramService.escapeHtml(patientName)}\n` +
          `🩸 <b>កម្រិតជាតិស្ករ:</b> <code>${latest?.valueMgDl} mg/dL</code>\n` +
          `🕒 <b>ពេលវាស់:</b> ${typeLabels.km} (${dateStr})\n` +
          `🎯 <b>ស្ថានភាព:</b> ${statusEmoji} ${statusTextKm}\n`;

        if (todayRecords.length > 1) {
          response += `\n📋 <b>ការវាស់ក្នុងថ្ងៃនេះ (${todayRecords.length} លើក):</b>\n`;
          todayRecords.forEach((r, idx) => {
            const time = new Date(r.measuredAt).toLocaleTimeString('en-US', {
              timeZone: 'Asia/Phnom_Penh',
              hour: '2-digit',
              minute: '2-digit'
            });
            response += `${idx + 1}. <b>${r.valueMgDl} mg/dL</b> — ${r.measurementType} (${time})\n`;
          });
        }

        return response;
      }

      case 'targets': {
        const patientName = patient.fullNameKm || patient.fullName;
        const targets = await HealthRepository.getGlucoseTargets(patient.id);

        let fastingTargetStr = '80–130 mg/dL (ADA Reference)';
        let postmealTargetStr = '< 180 mg/dL (ADA Reference)';

        const approvedFasting = targets.find(
          (t) => t.measurementType === 'fasting' && t.approvalStatus === 'approved' && t.isActive
        );
        if (approvedFasting) {
          fastingTargetStr = `${approvedFasting.targetMin}–${approvedFasting.targetMax} mg/dL (Approved by Clinician)`;
        }

        const approvedPostmeal = targets.find(
          (t) =>
            (t.measurementType === '2h_after_meal' || t.measurementType === '1h_after_meal') &&
            t.approvalStatus === 'approved' &&
            t.isActive
        );
        if (approvedPostmeal) {
          postmealTargetStr = `≤ ${approvedPostmeal.targetMax} mg/dL (Approved by Clinician)`;
        }

        return (
          `🎯 <b>គោលដៅជាតិស្ករគ្លីនិក (Clinical Glucose Targets)</b>\n\n` +
          `👤 <b>អ្នកជំងឺ:</b> ${TelegramService.escapeHtml(patientName)}\n\n` +
          `🌅 <b>ពេលព្រឹកព្រលឹម (Fasting):</b>\n` +
          `   • គោលដៅ៖ <code>${fastingTargetStr}</code>\n\n` +
          `🍽️ <b>ក្រោយអាហារ ២ ម៉ោង (Post-meal):</b>\n` +
          `   • គោលដៅ៖ <code>${postmealTargetStr}</code>\n\n` +
          `🚨 <b>កម្រិតប្រកាសអាសន្នទាប (Hypoglycemia threshold):</b>\n` +
          `   • ក្រោម <code>70 mg/dL</code> ត្រូវអនុវត្តក្បួន 15-15 ភ្លាមៗ!\n\n` +
          `ℹ️ <i>យោងតាមគោលការណ៍ណែនាំស្តង់ដារជំងឺទឹកនោមផ្អែម ADA Standards of Care 2026។</i>`
        );
      }

      case 'meds': {
        const patientName = patient.fullNameKm || patient.fullName;
        const medications = await HealthRepository.getMedications(patient.id);
        const activeMeds = medications.filter((m) => m.isActive !== false);

        let response =
          `💊 <b>កាលវិភាគថ្នាំប្រចាំថ្ងៃ (Daily Medications)</b>\n\n` +
          `👤 <b>អ្នកជំងឺ:</b> ${TelegramService.escapeHtml(patientName)}\n\n`;

        if (activeMeds.length === 0) {
          response +=
            `1. <b>Domicron</b> 30 mg (Gliclazide MR)\n` +
            `   • ការប្រើប្រាស់៖ 1 គ្រាប់ពេលព្រឹក (លេបជាមួយអាហារពេលព្រឹក)\n\n` +
            `2. <b>Gsiptin -M</b> 50mg/1000mg (Sitagliptin + Metformin)\n` +
            `   • ការប្រើប្រាស់៖ 1 គ្រាប់ពេលព្រឹក និង 1 គ្រាប់ពេលល្ងាច (លេបក្រោយអាហារ)\n\n`;
        } else {
          activeMeds.forEach((med, idx) => {
            const genericName = med.genericName ? ` (${med.genericName})` : '';
            const instructions = med.timingInstructions
              ? `\n   👉 ${med.timingInstructions}`
              : '';

            response +=
              `${idx + 1}. <b>${TelegramService.escapeHtml(med.name)}</b> ${med.dosage || ''}${genericName}\n` +
              `   • ការប្រើប្រាស់៖ ${med.frequency}${instructions}\n\n`;
          });
        }

        response +=
          `⚠️ <i>ការរំលឹកសុវត្ថិភាព៖ សូមកុំផ្លាស់ប្តូរកម្រិតថ្នាំដោយគ្មានការពិគ្រោះជាមួយគ្រូពេទ្យព្យាបាល។</i>`;
        return response;
      }

      case 'link': {
        // Link Telegram chat ID with current patient
        if (args.length > 0 && args[0]) {
          const targetId = args[0];
          await HealthRepository.updatePatientProfile(targetId, {
            telegramChatId: String(chatId),
            telegramNotificationsEnabled: true
          });
          return `✅ បានភ្ជាប់ Chat ID <code>${chatId}</code> ជាមួយអ្នកជំងឺជោគជ័យ!`;
        }

        await HealthRepository.updatePatientProfile(patient.id, {
          telegramChatId: String(chatId),
          telegramNotificationsEnabled: true
        });

        return (
          `✅ <b>បានភ្ជាប់ Telegram Bot ជោគជ័យ!</b>\n\n` +
          `Chat ID <code>${chatId}</code> ត្រូវបានភ្ជាប់ជាមួយ <b>${TelegramService.escapeHtml(
            patient.fullNameKm || patient.fullName
          )}</b>។\n` +
          `ឥឡូវនេះ អ្នកអាចផ្ញើកម្រិតជាតិស្ករដោយផ្ទាល់មកទីនេះដើម្បីកត់ត្រាបានហើយ។`
        );
      }

      default: {
        return (
          `❓ <b>ពាក្យបញ្ជាមិនស្គាល់ (Unknown Command)</b>\n\n` +
          `សូមវាយ <code>/help</code> ដើម្បីមើលបញ្ជីពាក្យបញ្ជា ឬវាយកម្រិតជាតិស្ករដើម្បីកត់ត្រា ឧទាហរណ៍៖\n` +
          `<code>148 fasting</code> ឬ <code>១៤៨ មុនបាយ</code>`
        );
      }
    }
  }

  /**
   * Process a parsed blood glucose reading and save to repository
   */
  public static async processGlucoseReading(
    chatId: string | number,
    parsed: ParsedTelegramInput,
    user?: TelegramUser
  ): Promise<string> {
    if (!parsed.isGlucoseReading || parsed.valueMgDl === undefined) {
      return (
        `👋 សួស្តី! ដើម្បីកត់ត្រាជាតិស្ករ សូមវាយលេខកម្រិតជាតិស្ករ ឧទាហរណ៍៖\n` +
        `<code>148 fasting</code> ឬ <code>១៤៨ មុនបាយ</code>\n\n` +
        `Hello! To log a glucose reading, enter e.g. <code>148 fasting</code> or type <code>/help</code>.`
      );
    }

    // Safety validation error check
    if (parsed.validationError) {
      return (
        `⚠️ <b>កំហុសក្នុងការកត់ត្រា (Recording Error)</b>\n\n` +
        `${parsed.validationErrorKm}\n\n` +
        `<i>${parsed.validationError}</i>`
      );
    }

    const patient = await HealthRepository.getPatientByTelegramChatId(chatId);
    const valueMgDl = parsed.valueMgDl;
    const measurementType = parsed.measurementType || 'fasting';
    const typeLabels = this.getMeasurementTypeLabels(measurementType);
    const patientName = patient.fullNameKm || patient.fullName;

    // Fetch latest prior record for comparison / trend calculation
    const prevRecord = await HealthRepository.getLatestGlucoseRecord(patient.id);

    // Create the record in Supabase / repository
    const currentUser = HealthRepository.getCurrentUser();
    const { record, alert } = await HealthRepository.createGlucoseRecord({
      patientId: patient.id,
      valueMgDl,
      measurementType,
      measuredAt: new Date().toISOString(),
      notes: `Logged via Telegram Bot by ${user?.first_name || 'Caregiver'}`,
      recordedBy: currentUser.id,
      recordedByName: user?.first_name ? `${user.first_name} (Telegram)` : 'Telegram Caregiver',
      recordedByRole: 'family_admin'
    });

    // Calculate trend vs previous reading
    let trendText = '';
    if (prevRecord) {
      const delta = valueMgDl - prevRecord.valueMgDl;
      const prevTime = new Date(prevRecord.measuredAt).toLocaleTimeString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        hour: '2-digit',
        minute: '2-digit'
      });
      if (delta > 0) {
        trendText = `📈 <b>ការប្រៀបធៀប:</b> +${delta} mg/dL ធៀបនឹងលើកមុន (${prevRecord.valueMgDl} mg/dL ម៉ោង ${prevTime})`;
      } else if (delta < 0) {
        trendText = `📉 <b>ការប្រៀបធៀប:</b> ${delta} mg/dL ធៀបនឹងលើកមុន (${prevRecord.valueMgDl} mg/dL ម៉ោង ${prevTime})`;
      } else {
        trendText = `➡️ <b>ការប្រៀបធៀប:</b> មិនប្រែប្រួល (ដូចលើកមុន ម៉ោង ${prevTime})`;
      }
    }

    // Evaluate target status and build target badge
    let statusHeader = '✅ <b>កត់ត្រាជាតិស្ករបានជោគជ័យ (Glucose Logged)</b>';
    let statusBadge = '✅ ស្ថិតក្នុងគោលដៅល្អ (Within Target)';
    let guidanceText =
      '💡 <b>ការណែនាំ:</b> ល្អណាស់! ជាតិស្ករស្ថិតក្នុងកម្រិតល្អ។ សូមបន្តទទួលទានអាហារសុខភាព និងលេបថ្នាំទៀងទាត់។';

    // 1. Critical Low / Hypoglycemia (< 70 mg/dL or < 54 mg/dL)
    if (valueMgDl < 70) {
      statusHeader = '🚨 <b>ប្រកាសអាសន្ន៖ ជាតិស្ករចុះទាប (HYPOGLYCEMIA ALERT)</b>';
      statusBadge =
        valueMgDl < 54
          ? '🚨 ទាបកម្រិតគ្រោះថ្នាក់ (< 54 mg/dL)'
          : '⚠️ ទាបក្រោម 70 mg/dL (Hypoglycemia)';

      guidanceText =
        `🛑 <b>អនុវត្តក្បួន 15-15 ភ្លាមៗ (Emergency Rule 15-15):</b>\n` +
        `1. <b>ញ៉ាំជាតិស្ករបន្ទាន់ 15 ក្រាម</b>៖\n` +
        `   • ស្ករគ្រាប់ ៣-៤ គ្រាប់\n` +
        `   • ឬទឹកផ្លែឈើ/ទឹកក្រូចកន្លះកែវ (120 ml)\n` +
        `   • ឬទឹកឃ្មុំ ១ ស្លាបព្រាបាយ\n` +
        `2. <b>សម្រាក ១៥ នាទី</b> រួចវាស់ជាតិស្ករឡើងវិញ។\n` +
        `3. បើនៅក្រោម 70 mg/dL ដដែល សូមញ៉ាំ 15 ក្រាមម្តងទៀត។\n` +
        `4. ប្រសិនបើសន្លប់ ឬមិនដឹងខ្លួន សូមទូរស័ព្ទទៅ <b>119</b> ជាបន្ទាន់! (កុំបញ្ចុកទឹក ឬអាហារពេលសន្លប់)`;
    }
    // 2. High Glucose (> 180 mg/dL or > 250 mg/dL)
    else if (valueMgDl > 180) {
      if (valueMgDl >= 250) {
        statusHeader = '🚨 <b>ប្រកាសអាសន្ន៖ ជាតិស្ករឡើងខ្ពស់ខ្លាំង (CRITICAL HIGH)</b>';
        statusBadge = '🚨 ឡើងខ្ពស់កម្រិតអាសន្ន (> 250 mg/dL)';
        guidanceText =
          `💡 <b>ការណែនាំបន្ទាន់:</b> ជាតិស្ករឡើងខ្ពស់ខ្លាំង! សូមពិនិត្យថ្នាំទឹកនោមផ្អែម ពិសារទឹកស្អាតឱ្យបានច្រើន និងទាក់ទងគ្រូពេទ្យប្រសិនបើមានអារម្មណ៍អស់កម្លាំងខ្លាំង ចង្អោរ ឬពិបាកដកដង្ហើម។`;
      } else {
        statusHeader = '⚠️ <b>កត់ត្រាជាតិស្ករបានជោគជ័យ (Glucose Logged)</b>';
        statusBadge = '⚠️ លើសគោលដៅកំណត់ (Above Target)';
        guidanceText =
          `💡 <b>ការណែនាំ:</b> សូមពិសារទឹកស្អាតឱ្យបានច្រើន កត់ត្រាអាហារដែលបានទទួលទាន និងវាស់ជាតិស្ករឡើងវិញក្រោយអាហារ ២ ម៉ោង។`;
      }
    }
    // 3. Below Target (70 - 79 mg/dL for fasting)
    else if (measurementType === 'fasting' && valueMgDl < 80) {
      statusHeader = '⚠️ <b>កត់ត្រាជាតិស្ករបានជោគជ័យ (Glucose Logged)</b>';
      statusBadge = '⚠️ ទាបជាងគោលដៅបន្តិច (Target: 80–130 mg/dL)';
      guidanceText =
        '💡 <b>ការណែនាំ:</b> ជាតិស្ករទាបជាង 80 mg/dL បន្តិច។ សូមតាមដានរោគសញ្ញាវិលមុខ ឬស្រវាំងភ្នែក និងពិសារអាហារពេលព្រឹកឱ្យបានទៀងទាត់។';
    }

    // Assemble rich confirmation card
    let response =
      `${statusHeader}\n\n` +
      `👤 <b>អ្នកជំងឺ (Patient):</b> ${TelegramService.escapeHtml(patientName)}\n` +
      `🩸 <b>កម្រិតជាតិស្ករ:</b> <code>${valueMgDl} mg/dL</code>\n` +
      `🕒 <b>ប្រភេទវាស់:</b> ${typeLabels.km}\n` +
      `🎯 <b>ស្ថានភាព:</b> ${statusBadge}\n`;

    if (trendText) {
      response += `${trendText}\n`;
    }

    response += `\n${guidanceText}\n`;

    if (parsed.isInferredType) {
      response += `\nℹ️ <i>សម្គាល់៖ ប្រភេទវាស់ត្រូវបានកំណត់តាមម៉ោង (${typeLabels.en})។ អ្នកអាចវាយបញ្ជាក់ដូចជា៖ <code>148 fasting</code> ឬ <code>150 ក្រោយបាយ</code>។</i>`;
    }

    return response;
  }

  /**
   * Main entry point for processing incoming Telegram Webhook updates
   */
  public static async handleUpdate(
    update: TelegramUpdate
  ): Promise<{ processed: boolean; responseText?: string; replySent: boolean }> {
    const message = update.message || update.edited_message;
    if (!message || !message.text) {
      return { processed: false, replySent: false };
    }

    const chatId = message.chat.id;
    const rawText = message.text;
    const user = message.from;

    const parsed = this.parseGlucoseInput(rawText);

    let replyText = '';

    if (parsed.isCommand && parsed.command) {
      replyText = await this.handleCommand(chatId, parsed.command, parsed.commandArgs, user);
    } else if (parsed.isGlucoseReading) {
      replyText = await this.processGlucoseReading(chatId, parsed, user);
    } else {
      // Unrecognized text without numbers or commands
      replyText =
        `👋 សួស្តី! ដើម្បីកត់ត្រាជាតិស្ករ សូមវាយលេខកម្រិតជាតិស្ករ ឧទាហរណ៍៖\n` +
        `• <code>148 fasting</code> ឬ <code>១៤៨ មុនបាយ</code>\n` +
        `• <code>165 after lunch</code> ឬ <code>១៦៥ ក្រោយបាយ</code>\n` +
        `• ឬវាយតែលេខ <code>148</code>\n\n` +
        `វាយ <code>/help</code> ដើម្បីមើលការណែនាំលម្អិត។\n\n` +
        `<i>Hello! Send a reading like <code>148 fasting</code> or type <code>/help</code>.</i>`;
    }

    // Send reply back to the Telegram chat
    const sendResult = await TelegramService.sendMessageRaw(chatId, replyText, {
      parseMode: 'HTML',
      disableWebPagePreview: true
    });

    return {
      processed: true,
      responseText: replyText,
      replySent: sendResult.success
    };
  }
}
