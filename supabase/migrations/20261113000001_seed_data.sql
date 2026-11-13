-- ============================================================================
-- Family Diabetes Care - Seed Data
-- Mom (Age 64, Oral Medication, 148 mg/dL Fasting Reading)
-- Caregiver (Child / Family Admin)
-- ============================================================================

-- Fixed UUIDs for predictable references
DO $$
DECLARE
    v_patient_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    v_admin_id UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
    v_mom_user_id UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789012';
    v_med_id UUID := 'd4e5f6a7-b8c9-0123-def1-234567890123';
BEGIN
    -- 1. Create Patient Profile
    INSERT INTO patient_profiles (
        id,
        full_name,
        full_name_km,
        date_of_birth,
        age_group,
        diabetes_type,
        diagnosis_status,
        current_medications_summary,
        allergies,
        medical_history,
        doctor_name,
        doctor_phone,
        doctor_clinic,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        preferred_glucose_unit,
        timezone,
        telegram_chat_id,
        telegram_notifications_enabled
    ) VALUES (
        v_patient_id,
        'Sokha Mey',
        'ម៉ាក់ សុខា',
        '1962-04-15',
        '60-69',
        'unknown',
        'under_monitoring',
        'Metformin 500mg (Oral Medication)',
        ARRAY['Penicillin'],
        'Mild hypertension, elevated fasting glucose monitored by family physician.',
        'Dr. Chanthy Keo',
        '+855 12 345 678',
        'Phnom Penh Diabetes & Endocrinology Clinic',
        'Dara Mey (Son)',
        '+855 17 888 999',
        'Son (កូនប្រុស)',
        'mg/dL',
        'Asia/Phnom_Penh',
        '-100123456789',
        true
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Educational & Caregiver Targets (Initial Unconfirmed Status)
    INSERT INTO glucose_targets (
        id,
        patient_id,
        measurement_type,
        target_min,
        target_max,
        low_alert_threshold,
        high_alert_threshold,
        effective_date,
        clinician_approval_status,
        clinician_notes
    ) VALUES
    (
        uuid_generate_v4(),
        v_patient_id,
        'fasting',
        80.0,
        130.0,
        70.0,
        140.0,
        NOW() - INTERVAL '30 days',
        'unconfirmed',
        'Standard educational reference range (80-130 mg/dL). Awaiting personalized confirmation from Dr. Chanthy Keo.'
    ),
    (
        uuid_generate_v4(),
        v_patient_id,
        'before_meal',
        80.0,
        130.0,
        70.0,
        140.0,
        NOW() - INTERVAL '30 days',
        'unconfirmed',
        'Standard pre-meal educational reference range.'
    ),
    (
        uuid_generate_v4(),
        v_patient_id,
        '2h_after_meal',
        90.0,
        180.0,
        70.0,
        180.0,
        NOW() - INTERVAL '30 days',
        'unconfirmed',
        'Post-meal threshold under 180 mg/dL according to general clinical guidelines.'
    ),
    (
        uuid_generate_v4(),
        v_patient_id,
        'bedtime',
        100.0,
        140.0,
        75.0,
        150.0,
        NOW() - INTERVAL '30 days',
        'unconfirmed',
        'Bedtime stability target to avoid nocturnal hypoglycemia.'
    ) ON CONFLICT DO NOTHING;

    -- 3. Oral Medication
    INSERT INTO medications (
        id,
        patient_id,
        name,
        dosage,
        frequency,
        timing_instructions,
        prescribing_doctor,
        start_date,
        is_active,
        notes
    ) VALUES (
        v_med_id,
        v_patient_id,
        'Metformin HCl',
        '500 mg',
        'Once daily',
        'Take with breakfast and a full glass of water',
        'Dr. Chanthy Keo',
        '2026-01-10',
        true,
        'Oral tablet for blood glucose management. Do not change dose without clinician advice.'
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Reminders
    INSERT INTO reminders (
        patient_id,
        reminder_type,
        title,
        title_km,
        time_of_day,
        days_of_week,
        is_active
    ) VALUES
    (
        v_patient_id,
        'glucose',
        'Fasting Blood Sugar Check',
        'ពិនិត្យជាតិស្ករពេលព្រឹកព្រលឹម (មុនអាហារ)',
        '06:30:00',
        ARRAY[1,2,3,4,5,6,7],
        true
    ),
    (
        v_patient_id,
        'medication',
        'Metformin Morning Dose (500mg)',
        'លេបថ្នាំជាតិស្ករពេលព្រឹក (Metformin 500mg)',
        '07:30:00',
        ARRAY[1,2,3,4,5,6,7],
        true
    ),
    (
        v_patient_id,
        'glucose',
        'Post-Lunch Glucose Check (2h after meal)',
        'ពិនិត្យជាតិស្ករក្រោយបាយថ្ងៃត្រង់ (២ម៉ោង)',
        '13:30:00',
        ARRAY[1,2,3,4,5,6,7],
        true
    ),
    (
        v_patient_id,
        'hba1c_test',
        'Next HbA1c Lab Test Checkup',
        'ការណាត់ជួបពិនិត្យឈាមធំ HbA1c នៅគ្លីនិក',
        '08:00:00',
        ARRAY[6],
        true
    ) ON CONFLICT DO NOTHING;

END $$;

