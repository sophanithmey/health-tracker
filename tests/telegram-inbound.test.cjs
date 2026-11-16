// ============================================================================
// Automated Test Suite: Two-Way Telegram Bot Logging Module
// Testing: Khmer digit normalization, context parsing, unit conversion,
//          safety bounds, interactive commands, 15-15 Rule hypoglycemia,
//          and inbound webhook update processing.
// ============================================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const jiti = require('jiti')(__filename);

const { TelegramInboundService } = jiti('../src/server/services/telegramInboundService.ts');
const { TelegramService } = jiti('../src/server/services/telegramService.ts');

const TEST_CHAT_ID = 'test-tg-chat-999999';

// ----------------------------------------------------------------------------
// 1. Khmer Numeral Normalization
// ----------------------------------------------------------------------------

test('normalizeKhmerNumerals converts all Khmer digits ០-៩ to 0-9', () => {
  const khmerString = '០១២៣៤៥៦៧៨៩';
  const normalized = TelegramInboundService.normalizeKhmerNumerals(khmerString);
  assert.equal(normalized, '0123456789');
});

test('normalizeKhmerNumerals converts mixed Khmer strings', () => {
  const mixed = 'ជាតិស្ករ ១៤៨ មុនបាយ';
  const normalized = TelegramInboundService.normalizeKhmerNumerals(mixed);
  assert.equal(normalized, 'ជាតិស្ករ 148 មុនបាយ');
});

test('normalizeKhmerNumerals handles decimal numbers in Khmer', () => {
  const decimal = '៧.៨';
  const normalized = TelegramInboundService.normalizeKhmerNumerals(decimal);
  assert.equal(normalized, '7.8');
});

// ----------------------------------------------------------------------------
// 2. Message Parsing: Commands
// ----------------------------------------------------------------------------

test('parseGlucoseInput recognizes bot commands', () => {
  const startCmd = TelegramInboundService.parseGlucoseInput('/start');
  assert.equal(startCmd.isCommand, true);
  assert.equal(startCmd.command, 'start');
  assert.equal(startCmd.isGlucoseReading, false);

  const helpCmd = TelegramInboundService.parseGlucoseInput('/help');
  assert.equal(helpCmd.isCommand, true);
  assert.equal(helpCmd.command, 'help');

  const latestCmd = TelegramInboundService.parseGlucoseInput('/latest');
  assert.equal(latestCmd.isCommand, true);
  assert.equal(latestCmd.command, 'latest');

  const targetsCmd = TelegramInboundService.parseGlucoseInput('/targets');
  assert.equal(targetsCmd.isCommand, true);
  assert.equal(targetsCmd.command, 'targets');

  const medsCmd = TelegramInboundService.parseGlucoseInput('/meds');
  assert.equal(medsCmd.isCommand, true);
  assert.equal(medsCmd.command, 'meds');
});

test('parseGlucoseInput strips bot username from command in group chats', () => {
  const groupCmd = TelegramInboundService.parseGlucoseInput('/today@family_diabetes_bot');
  assert.equal(groupCmd.isCommand, true);
  assert.equal(groupCmd.command, 'today');
});

// ----------------------------------------------------------------------------
// 3. Message Parsing: Blood Glucose Readings in English & Khmer
// ----------------------------------------------------------------------------

test('parseGlucoseInput parses fasting readings in English and Khmer', () => {
  const enFasting = TelegramInboundService.parseGlucoseInput('148 fasting');
  assert.equal(enFasting.isGlucoseReading, true);
  assert.equal(enFasting.valueMgDl, 148);
  assert.equal(enFasting.measurementType, 'fasting');
  assert.equal(enFasting.isInferredType, false);

  const kmFasting = TelegramInboundService.parseGlucoseInput('១៤៨ មុនបាយ');
  assert.equal(kmFasting.isGlucoseReading, true);
  assert.equal(kmFasting.valueMgDl, 148);
  assert.equal(kmFasting.measurementType, 'fasting');

  const kmMorning = TelegramInboundService.parseGlucoseInput('១២៥ ពេលព្រឹក');
  assert.equal(kmMorning.isGlucoseReading, true);
  assert.equal(kmMorning.valueMgDl, 125);
  assert.equal(kmMorning.measurementType, 'fasting');
});

test('parseGlucoseInput parses post-meal readings in English and Khmer', () => {
  const enPostMeal = TelegramInboundService.parseGlucoseInput('165 after lunch');
  assert.equal(enPostMeal.isGlucoseReading, true);
  assert.equal(enPostMeal.valueMgDl, 165);
  assert.equal(enPostMeal.measurementType, '2h_after_meal');

  const kmPostMeal = TelegramInboundService.parseGlucoseInput('១៦៥ ក្រោយអាហារ');
  assert.equal(kmPostMeal.isGlucoseReading, true);
  assert.equal(kmPostMeal.valueMgDl, 165);
  assert.equal(kmPostMeal.measurementType, '2h_after_meal');

  const en1hPostMeal = TelegramInboundService.parseGlucoseInput('180 1h after meal');
  assert.equal(en1hPostMeal.isGlucoseReading, true);
  assert.equal(en1hPostMeal.valueMgDl, 180);
  assert.equal(en1hPostMeal.measurementType, '1h_after_meal');

  const km1hPostMeal = TelegramInboundService.parseGlucoseInput('១៧៥ ក្រោយបាយ១ម៉ោង');
  assert.equal(km1hPostMeal.isGlucoseReading, true);
  assert.equal(km1hPostMeal.valueMgDl, 175);
  assert.equal(km1hPostMeal.measurementType, '1h_after_meal');
});

test('parseGlucoseInput parses bedtime and random readings', () => {
  const bedtimeEn = TelegramInboundService.parseGlucoseInput('120 bedtime');
  assert.equal(bedtimeEn.isGlucoseReading, true);
  assert.equal(bedtimeEn.valueMgDl, 120);
  assert.equal(bedtimeEn.measurementType, 'bedtime');

  const bedtimeKm = TelegramInboundService.parseGlucoseInput('១២០ មុនគេង');
  assert.equal(bedtimeKm.isGlucoseReading, true);
  assert.equal(bedtimeKm.valueMgDl, 120);
  assert.equal(bedtimeKm.measurementType, 'bedtime');

  const randomEn = TelegramInboundService.parseGlucoseInput('135 random');
  assert.equal(randomEn.isGlucoseReading, true);
  assert.equal(randomEn.valueMgDl, 135);
  assert.equal(randomEn.measurementType, 'random');

  const randomKm = TelegramInboundService.parseGlucoseInput('១៣៥ ចៃដន្យ');
  assert.equal(randomKm.isGlucoseReading, true);
  assert.equal(randomKm.valueMgDl, 135);
  assert.equal(randomKm.measurementType, 'random');
});

// ----------------------------------------------------------------------------
// 4. Default Type Inference & Unit Conversion
// ----------------------------------------------------------------------------

test('parseGlucoseInput infers measurement type from time when number only is sent', () => {
  // Morning 07:00 UTC+7 (00:00 UTC)
  const morningDate = new Date('2026-11-14T00:30:00Z');
  const morningResult = TelegramInboundService.parseGlucoseInput('148', morningDate);
  assert.equal(morningResult.isGlucoseReading, true);
  assert.equal(morningResult.valueMgDl, 148);
  assert.equal(morningResult.measurementType, 'fasting');
  assert.equal(morningResult.isInferredType, true);

  // Khmer number only
  const kmMorningResult = TelegramInboundService.parseGlucoseInput('១៤៨', morningDate);
  assert.equal(kmMorningResult.isGlucoseReading, true);
  assert.equal(kmMorningResult.valueMgDl, 148);
  assert.equal(kmMorningResult.measurementType, 'fasting');
  assert.equal(kmMorningResult.isInferredType, true);

  // Noon 12:30 UTC+7 (05:30 UTC)
  const noonDate = new Date('2026-11-14T05:30:00Z');
  const noonResult = TelegramInboundService.parseGlucoseInput('160', noonDate);
  assert.equal(noonResult.measurementType, '2h_after_meal');
  assert.equal(noonResult.isInferredType, true);

  // Night 22:00 UTC+7 (15:00 UTC)
  const nightDate = new Date('2026-11-14T15:00:00Z');
  const nightResult = TelegramInboundService.parseGlucoseInput('125', nightDate);
  assert.equal(nightResult.measurementType, 'bedtime');
  assert.equal(nightResult.isInferredType, true);
});

test('parseGlucoseInput converts mmol/L to mg/dL correctly', () => {
  const mmolResult = TelegramInboundService.parseGlucoseInput('7.0 mmol/L fasting');
  assert.equal(mmolResult.isGlucoseReading, true);
  // 7.0 * 18.0182 = 126 mg/dL
  assert.equal(mmolResult.valueMgDl, 126);
  assert.equal(mmolResult.originalUnit, 'mmol/L');
  assert.equal(mmolResult.measurementType, 'fasting');
});

// ----------------------------------------------------------------------------
// 5. Clinical Safety Range Boundaries
// ----------------------------------------------------------------------------

test('parseGlucoseInput rejects readings below 20 mg/dL with safety error', () => {
  const lowResult = TelegramInboundService.parseGlucoseInput('15');
  assert.equal(lowResult.isGlucoseReading, true);
  assert.ok(lowResult.validationError);
  assert.match(lowResult.validationError, /at least 20 mg\/dL/i);
  assert.match(lowResult.validationErrorKm, /យ៉ាងហោចណាស់ 20 mg\/dL/);
});

test('parseGlucoseInput flags extreme readings above 600 mg/dL with emergency error', () => {
  const highResult = TelegramInboundService.parseGlucoseInput('750');
  assert.equal(highResult.isGlucoseReading, true);
  assert.ok(highResult.validationError);
  assert.match(highResult.validationError, /exceeds standard meter limits/i);
  assert.match(highResult.validationErrorKm, /លើសពី 600 mg\/dL/);
});

// ----------------------------------------------------------------------------
// 6. Interactive Bot Commands Execution
// ----------------------------------------------------------------------------

test('handleCommand responds to /start and /help with comprehensive bilingual guide', async () => {
  const helpText = await TelegramInboundService.handleCommand(TEST_CHAT_ID, 'help');
  assert.match(helpText, /ជំនួយការថែទាំជាតិស្ករគ្រួសារ/);
  assert.match(helpText, /របៀបកត់ត្រាជាតិស្ករ/);
  assert.match(helpText, /148 fasting/);
  assert.match(helpText, /១៤៨ មុនបាយ/);
  assert.match(helpText, /\/latest/);
  assert.match(helpText, /\/targets/);
  assert.match(helpText, /\/meds/);
});

test('handleCommand responds to /targets with clinical targets and ADA references', async () => {
  const targetsText = await TelegramInboundService.handleCommand(TEST_CHAT_ID, 'targets');
  assert.match(targetsText, /គោលដៅជាតិស្ករគ្លីនិក/);
  assert.match(targetsText, /Fasting/);
  assert.match(targetsText, /Post-meal/);
  assert.match(targetsText, /70 mg\/dL/);
  assert.match(targetsText, /ADA Standards of Care/);
});

test('handleCommand responds to /meds with active medications and schedule', async () => {
  const medsText = await TelegramInboundService.handleCommand(TEST_CHAT_ID, 'meds');
  assert.match(medsText, /កាលវិភាគថ្នាំប្រចាំថ្ងៃ/);
  assert.match(medsText, /Domicron/);
  assert.match(medsText, /Gsiptin/);
  assert.match(medsText, /ការរំលឹកសុវត្ថិភាព/);
});

test('handleCommand responds to /latest with glucose record summary', async () => {
  const latestText = await TelegramInboundService.handleCommand(TEST_CHAT_ID, 'latest');
  assert.match(latestText, /កម្រិតជាតិស្ករ|សង្ខេបជាតិស្ករ/);
  assert.match(latestText, /អ្នកជំងឺ/);
});

// ----------------------------------------------------------------------------
// 7. Glucose Reading Processing & Hypoglycemia 15-15 Rule
// ----------------------------------------------------------------------------

test('processGlucoseReading returns within-target confirmation card', async () => {
  const parsed = TelegramInboundService.parseGlucoseInput('115 fasting');
  const response = await TelegramInboundService.processGlucoseReading(TEST_CHAT_ID, parsed);
  assert.match(response, /កត់ត្រាជាតិស្ករបានជោគជ័យ/);
  assert.match(response, /115 mg\/dL/);
  assert.match(response, /មុនអាហារពេលព្រឹក/);
  assert.match(response, /ស្ថិតក្នុងគោលដៅល្អ/);
});

test('processGlucoseReading provides Rule 15-15 instructions when blood sugar < 70 mg/dL', async () => {
  const lowParsed = TelegramInboundService.parseGlucoseInput('62 fasting');
  const response = await TelegramInboundService.processGlucoseReading(TEST_CHAT_ID, lowParsed);

  assert.match(response, /ប្រកាសអាសន្ន៖ ជាតិស្ករចុះទាប/);
  assert.match(response, /62 mg\/dL/);
  assert.match(response, /អនុវត្តក្បួន 15-15 ភ្លាមៗ/);
  assert.match(response, /ញ៉ាំជាតិស្ករបន្ទាន់ 15 ក្រាម/);
  assert.match(response, /ស្ករគ្រាប់ ៣-៤ គ្រាប់/);
  assert.match(response, /សម្រាក ១៥ នាទី/);
  assert.match(response, /119/);
});

test('processGlucoseReading provides critical alert for severe low < 54 mg/dL', async () => {
  const severeLow = TelegramInboundService.parseGlucoseInput('48 fasting');
  const response = await TelegramInboundService.processGlucoseReading(TEST_CHAT_ID, severeLow);

  assert.match(response, /ទាបកម្រិតគ្រោះថ្នាក់/);
  assert.match(response, /48 mg\/dL/);
  assert.match(response, /119/);
});

test('processGlucoseReading handles above target readings with hydration advice', async () => {
  const highParsed = TelegramInboundService.parseGlucoseInput('195 after lunch');
  const response = await TelegramInboundService.processGlucoseReading(TEST_CHAT_ID, highParsed);

  assert.match(response, /195 mg\/dL/);
  assert.match(response, /លើសគោលដៅកំណត់/);
  assert.match(response, /ពិសារទឹកស្អាតឱ្យបានច្រើន/);
});

// ----------------------------------------------------------------------------
// 8. Full Inbound Webhook Update Flow
// ----------------------------------------------------------------------------

test('handleUpdate successfully processes incoming update with Khmer glucose reading', async () => {
  const mockUpdate = {
    update_id: 10001,
    message: {
      message_id: 501,
      from: {
        id: 12345678,
        first_name: 'Caregiver',
        username: 'caregiver_son'
      },
      chat: {
        id: TEST_CHAT_ID,
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: '១៤៨ មុនបាយ'
    }
  };

  const result = await TelegramInboundService.handleUpdate(mockUpdate);
  assert.equal(result.processed, true);
  assert.equal(result.replySent, true);
  assert.match(result.responseText, /148 mg\/dL/);
  assert.match(result.responseText, /មុនអាហារពេលព្រឹក/);
});

test('handleUpdate successfully processes incoming /help command', async () => {
  const mockUpdate = {
    update_id: 10002,
    message: {
      message_id: 502,
      from: {
        id: 12345678,
        first_name: 'Mom'
      },
      chat: {
        id: TEST_CHAT_ID,
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: '/help'
    }
  };

  const result = await TelegramInboundService.handleUpdate(mockUpdate);
  assert.equal(result.processed, true);
  assert.equal(result.replySent, true);
  assert.match(result.responseText, /ជំនួយការថែទាំជាតិស្ករគ្រួសារ/);
});

