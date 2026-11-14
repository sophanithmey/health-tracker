// ============================================================================
// Automated Test Suite: Personalized Glucose Targets Module
// Testing: Target creation, approval workflow, one-sided bounds,
//          historical evaluation, audit logging, and medical safeguards.
// ============================================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const jiti = require('jiti')(__filename);

const {
  GlucoseTargetService,
  ADA_GUIDELINE_TARGETS
} = jiti('../src/server/services/glucoseTargetService.ts');
const {
  CreateGlucoseTargetSchema,
  UpdateGlucoseTargetSchema,
  EvaluateGlucoseReadingSchema
} = jiti('../src/server/schemas/validation.ts');
const { SafeAlertEngine } = jiti('../src/server/services/alertEngine.ts');

const MOCK_PATIENT_ID = 'test-patient-target-001';
const MOCK_ADMIN_USER = {
  id: 'user-admin-1',
  fullName: 'Caregiver Admin',
  role: 'family_admin',
  preferredLanguage: 'km'
};
const MOCK_CLINICIAN_USER = {
  id: 'user-clinician-1',
  fullName: 'Dr. Chea Sambath',
  role: 'clinician',
  preferredLanguage: 'km'
};

// ----------------------------------------------------------------------------
// 1. ADA Guidelines Medical Reference
// ----------------------------------------------------------------------------

test('ADA_GUIDELINE_TARGETS provides standard glycemic goals for all measurement types', () => {
  assert.equal(ADA_GUIDELINE_TARGETS.fasting.minMgDl, 80);
  assert.equal(ADA_GUIDELINE_TARGETS.fasting.maxMgDl, 130);
  assert.equal(ADA_GUIDELINE_TARGETS['2h_after_meal'].maxMgDl, 180);
  assert.equal(ADA_GUIDELINE_TARGETS.bedtime.minMgDl, 100);
  assert.equal(ADA_GUIDELINE_TARGETS.bedtime.maxMgDl, 140);
  assert.equal(ADA_GUIDELINE_TARGETS.fasting.guidelineSource, 'ADA Standards of Care in Diabetes');
  assert.equal(ADA_GUIDELINE_TARGETS.fasting.guidelineVersion, '2026');
});

// ----------------------------------------------------------------------------
// 2. Schema Validation Tests
// ----------------------------------------------------------------------------

test('CreateGlucoseTargetSchema accepts valid range bounds', () => {
  const valid = CreateGlucoseTargetSchema.parse({
    measurementType: 'fasting',
    minValue: 80,
    maxValue: 130,
    unit: 'mg/dL'
  });
  assert.equal(valid.measurementType, 'fasting');
  assert.equal(valid.minValue, 80);
  assert.equal(valid.maxValue, 130);
  assert.equal(valid.unit, 'mg/dL');
});

test('CreateGlucoseTargetSchema accepts one-sided upper threshold', () => {
  const upperOnly = CreateGlucoseTargetSchema.parse({
    measurementType: '2h_after_meal',
    maxValue: 180
  });
  assert.equal(upperOnly.maxValue, 180);
  assert.equal(upperOnly.minValue, undefined);
});

test('CreateGlucoseTargetSchema accepts one-sided lower threshold', () => {
  const lowerOnly = CreateGlucoseTargetSchema.parse({
    measurementType: 'bedtime',
    minValue: 100
  });
  assert.equal(lowerOnly.minValue, 100);
  assert.equal(lowerOnly.maxValue, undefined);
});

test('CreateGlucoseTargetSchema rejects when min >= max', () => {
  assert.throws(() => {
    CreateGlucoseTargetSchema.parse({
      measurementType: 'fasting',
      minValue: 140,
      maxValue: 120
    });
  });
});

test('CreateGlucoseTargetSchema rejects non-positive or negative values', () => {
  assert.throws(() => {
    CreateGlucoseTargetSchema.parse({
      measurementType: 'fasting',
      minValue: -10,
      maxValue: 130
    });
  });
});

test('CreateGlucoseTargetSchema rejects when neither min nor max is provided', () => {
  assert.throws(() => {
    CreateGlucoseTargetSchema.parse({
      measurementType: 'fasting'
    });
  });
});

test('CreateGlucoseTargetSchema validates effectiveUntil is after effectiveFrom', () => {
  assert.throws(() => {
    CreateGlucoseTargetSchema.parse({
      measurementType: 'fasting',
      minValue: 80,
      maxValue: 130,
      effectiveFrom: '2026-11-20T00:00:00Z',
      effectiveUntil: '2026-11-10T00:00:00Z'
    });
  });
});

// ----------------------------------------------------------------------------
// 3. Target Creation & Approval Workflow Tests
// ----------------------------------------------------------------------------

test('Target created by family_admin starts in pending approval state', async () => {
  const target = await GlucoseTargetService.createTarget(
    {
      patientId: MOCK_PATIENT_ID,
      measurementType: 'fasting',
      minValue: 85,
      maxValue: 125,
      notes: 'Proposed tighter fasting target by caregiver'
    },
    MOCK_ADMIN_USER
  );

  assert.equal(target.approvalStatus, 'pending');
  assert.equal(target.clinicianApprovalStatus, 'unconfirmed');
  assert.equal(target.createdBy, MOCK_ADMIN_USER.id);
  assert.equal(target.minValue, 85);
  assert.equal(target.maxValue, 125);
  assert.equal(target.isActive, true);
});

test('Clinician approval activates target and updates approved metadata', async () => {
  // First create a pending target
  const pending = await GlucoseTargetService.createTarget(
    {
      patientId: MOCK_PATIENT_ID,
      measurementType: 'before_meal',
      minValue: 80,
      maxValue: 130,
      notes: 'Awaiting clinic review'
    },
    MOCK_ADMIN_USER
  );

  assert.equal(pending.approvalStatus, 'pending');

  // Clinician approves
  const approved = await GlucoseTargetService.approveTarget(
    pending.id,
    { reason: 'Approved during endocrine consultation' },
    MOCK_CLINICIAN_USER
  );

  assert.ok(approved);
  assert.equal(approved.approvalStatus, 'approved');
  assert.equal(approved.clinicianApprovalStatus, 'clinician_approved');
  assert.equal(approved.approvedBy, MOCK_CLINICIAN_USER.id);
  assert.equal(approved.approvedByName, MOCK_CLINICIAN_USER.fullName);
  assert.ok(approved.approvedAt);
});

test('Clinician rejection sets status to rejected and marks isActive false', async () => {
  const pending = await GlucoseTargetService.createTarget(
    {
      patientId: MOCK_PATIENT_ID,
      measurementType: 'bedtime',
      minValue: 70,
      maxValue: 100,
      notes: 'Proposed bedtime target'
    },
    MOCK_ADMIN_USER
  );

  const rejected = await GlucoseTargetService.rejectTarget(
    pending.id,
    { reason: 'Too strict for senior patient at night (hypoglycemia risk)' },
    MOCK_CLINICIAN_USER
  );

  assert.ok(rejected);
  assert.equal(rejected.approvalStatus, 'rejected');
  assert.equal(rejected.isActive, false);
});

// ----------------------------------------------------------------------------
// 4. Target Evaluation Service Tests
// ----------------------------------------------------------------------------

test('evaluateReading returns target_not_configured when no approved target exists', async () => {
  const result = await GlucoseTargetService.evaluateReading({
    patientId: 'unconfigured-patient-999',
    measurementType: 'fasting',
    valueMgDl: 145
  });

  assert.equal(result.status, 'target_not_configured');
  assert.equal(result.isEducationalReferenceOnly, true);
  assert.ok(result.generalReference);
  assert.equal(result.generalReference.measurementType, 'fasting');
  assert.ok(result.explanationEn.includes('Personal target not configured'));
});

test('evaluateReading evaluates correctly against approved range target', async () => {
  // Create and approve a fasting target (80–130)
  const target = await GlucoseTargetService.createTarget(
    {
      patientId: 'eval-test-patient-1',
      measurementType: 'fasting',
      minValue: 80,
      maxValue: 130
    },
    MOCK_CLINICIAN_USER
  );
  assert.equal(target.approvalStatus, 'approved');

  // Test reading within target (105 mg/dL)
  const normalResult = await GlucoseTargetService.evaluateReading({
    patientId: 'eval-test-patient-1',
    measurementType: 'fasting',
    valueMgDl: 105
  });
  assert.equal(normalResult.status, 'within_target');
  assert.equal(normalResult.isEducationalReferenceOnly, false);

  // Test reading above target (148 mg/dL)
  const highResult = await GlucoseTargetService.evaluateReading({
    patientId: 'eval-test-patient-1',
    measurementType: 'fasting',
    valueMgDl: 148
  });
  assert.equal(highResult.status, 'above_target');
  assert.equal(highResult.differenceFromMax, 18);
  assert.ok(highResult.explanationEn.includes('above the configured target'));

  // Test reading below target (74 mg/dL)
  const lowResult = await GlucoseTargetService.evaluateReading({
    patientId: 'eval-test-patient-1',
    measurementType: 'fasting',
    valueMgDl: 74
  });
  assert.equal(lowResult.status, 'below_target');
  assert.equal(lowResult.differenceFromMin, 6);
});

test('evaluateReading handles one-sided upper threshold (e.g. post-meal <= 180)', async () => {
  const target = await GlucoseTargetService.createTarget(
    {
      patientId: 'eval-test-patient-2',
      measurementType: '2h_after_meal',
      minValue: null,
      maxValue: 180
    },
    MOCK_CLINICIAN_USER
  );

  const goodPostMeal = await GlucoseTargetService.evaluateReading({
    patientId: 'eval-test-patient-2',
    measurementType: '2h_after_meal',
    valueMgDl: 165
  });
  assert.equal(goodPostMeal.status, 'within_target');

  const elevatedPostMeal = await GlucoseTargetService.evaluateReading({
    patientId: 'eval-test-patient-2',
    measurementType: '2h_after_meal',
    valueMgDl: 210
  });
  assert.equal(elevatedPostMeal.status, 'above_target');
  assert.equal(elevatedPostMeal.differenceFromMax, 30);
});

// ----------------------------------------------------------------------------
// 5. Audit Logging Tests
// ----------------------------------------------------------------------------

test('Target changes and approval events are recorded in audit logs', async () => {
  const patientId = 'audit-test-patient-1';

  const t = await GlucoseTargetService.createTarget(
    {
      patientId,
      measurementType: 'fasting',
      minValue: 90,
      maxValue: 140
    },
    MOCK_ADMIN_USER
  );

  await GlucoseTargetService.approveTarget(
    t.id,
    { reason: 'Care plan confirmed with clinician' },
    MOCK_CLINICIAN_USER
  );

  const logs = await GlucoseTargetService.getAuditLogs(patientId);
  assert.ok(logs.length >= 2);

  const createdLog = logs.find((l) => l.action === 'created');
  const approvedLog = logs.find((l) => l.action === 'approved');

  assert.ok(createdLog);
  assert.ok(approvedLog);
  assert.equal(approvedLog.changedBy, MOCK_CLINICIAN_USER.id);
});

// ----------------------------------------------------------------------------
// 6. Alert Engine Safety & Deduplication
// ----------------------------------------------------------------------------

test('SafeAlertEngine does not suppress critical alerts even if repeated', () => {
  const criticalAlert = {
    category: 'critical',
    alertType: 'critical_low'
  };
  const recentAlerts = [
    {
      category: 'critical',
      alertType: 'critical_low',
      createdAt: new Date().toISOString()
    }
  ];

  // Critical alerts must NEVER be deduplicated / suppressed
  const shouldDeduplicate = SafeAlertEngine.shouldDeduplicate(criticalAlert, recentAlerts, 60);
  assert.equal(shouldDeduplicate, false);
});

