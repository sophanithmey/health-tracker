-- ============================================================================
-- Family Diabetes Care (ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ)
-- Database Schema Migration: Initial Tables, Enums, Indexes & RLS Policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Caregivers and Patients)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('family_admin', 'patient')),
    phone TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'km' CHECK (preferred_language IN ('km', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    full_name_km TEXT,
    date_of_birth DATE,
    age_group TEXT NOT NULL DEFAULT '60-69',
    diabetes_type TEXT NOT NULL DEFAULT 'unknown' CHECK (diabetes_type IN ('unknown', 'type_1', 'type_2', 'other')),
    diagnosis_status TEXT NOT NULL DEFAULT 'under_monitoring',
    current_medications_summary TEXT DEFAULT 'Oral medication',
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    medical_history TEXT,
    doctor_name TEXT,
    doctor_phone TEXT,
    doctor_clinic TEXT,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relation TEXT NOT NULL,
    preferred_glucose_unit TEXT NOT NULL DEFAULT 'mg/dL' CHECK (preferred_glucose_unit IN ('mg/dL', 'mmol/L')),
    timezone TEXT NOT NULL DEFAULT 'Asia/Phnom_Penh',
    telegram_chat_id TEXT,
    telegram_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FAMILY MEMBERS (Access Control & Relationships)
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL, -- e.g. 'child', 'spouse', 'caregiver', 'self'
    role TEXT NOT NULL CHECK (role IN ('family_admin', 'patient')),
    access_level TEXT NOT NULL DEFAULT 'full' CHECK (access_level IN ('full', 'read_and_record', 'read_only')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_patient_user UNIQUE (patient_id, user_id)
);

-- 4. PERSONALIZED GLUCOSE TARGETS
CREATE TABLE IF NOT EXISTS glucose_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    measurement_type TEXT NOT NULL CHECK (measurement_type IN ('fasting', 'before_meal', '1h_after_meal', '2h_after_meal', 'bedtime', 'other')),
    target_min NUMERIC(5, 1) NOT NULL,
    target_max NUMERIC(5, 1) NOT NULL,
    low_alert_threshold NUMERIC(5, 1) NOT NULL DEFAULT 70.0,
    high_alert_threshold NUMERIC(5, 1) NOT NULL DEFAULT 180.0,
    effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    configured_by UUID REFERENCES profiles(id),
    clinician_approval_status TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (clinician_approval_status IN ('unconfirmed', 'clinician_approved')),
    clinician_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. GLUCOSE RECORDS
CREATE TABLE IF NOT EXISTS glucose_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    value_mgdl NUMERIC(5, 1) NOT NULL CHECK (value_mgdl > 0 AND value_mgdl <= 600),
    measurement_type TEXT NOT NULL CHECK (measurement_type IN ('fasting', 'before_meal', '1h_after_meal', '2h_after_meal', 'bedtime', 'other')),
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    meal_description TEXT,
    symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    target_status TEXT NOT NULL DEFAULT 'normal' CHECK (target_status IN ('critical_low', 'low', 'normal', 'high', 'attention_high')),
    alert_triggered BOOLEAN NOT NULL DEFAULT false,
    alert_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MEDICATIONS
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    timing_instructions TEXT, -- e.g. "Take with breakfast"
    prescribing_doctor TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MEDICATION LOGS
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped_by_doctor')),
    scheduled_time TIMESTAMPTZ NOT NULL,
    recorded_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MEAL LOGS
CREATE TABLE IF NOT EXISTS meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    food_description TEXT NOT NULL,
    portion_size TEXT, -- e.g. "Small bowl (1 cup)", "1 piece"
    carb_estimate TEXT CHECK (carb_estimate IN ('low', 'moderate', 'high')),
    cambodian_dish_id TEXT, -- references Cambodian food catalog
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('walking', 'light_stretching', 'gardening', 'household', 'other')),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    intensity TEXT NOT NULL DEFAULT 'light' CHECK (intensity IN ('light', 'moderate', 'vigorous')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. LIFESTYLE JOURNALS (Daily water, sleep, symptoms summary)
CREATE TABLE IF NOT EXISTS lifestyle_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    water_glasses INTEGER DEFAULT 0 CHECK (water_glasses >= 0),
    sleep_hours NUMERIC(3, 1) DEFAULT 0 CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_patient_log_date UNIQUE (patient_id, log_date)
);

-- 11. REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('glucose', 'medication', 'doctor_visit', 'hba1c_test')),
    title TEXT NOT NULL,
    title_km TEXT,
    time_of_day TIME NOT NULL,
    days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS & ALERTS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    glucose_record_id UUID REFERENCES glucose_records(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('critical', 'attention', 'info')),
    alert_type TEXT NOT NULL, -- 'critical_low', 'attention_low', 'target_exceeded', 'repeated_high', 'reminder', 'daily_summary'
    title TEXT NOT NULL,
    title_km TEXT,
    message TEXT NOT NULL,
    message_km TEXT,
    guidance_summary TEXT,
    guidance_summary_km TEXT,
    channel TEXT NOT NULL DEFAULT 'telegram' CHECK (channel IN ('telegram', 'in_app', 'both')),
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'retrying')),
    delivery_attempts INTEGER NOT NULL DEFAULT 0,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. MEDICAL RECORDS (Reports & Lab Documents)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL CHECK (record_type IN ('hba1c', 'lipid_panel', 'kidney_function', 'eye_exam', 'doctor_summary', 'other')),
    title TEXT NOT NULL,
    test_date DATE NOT NULL,
    doctor_or_clinic TEXT,
    metrics JSONB DEFAULT '{}'::JSONB,
    notes TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    changes JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_patient ON family_members(patient_id);
CREATE INDEX IF NOT EXISTS idx_glucose_records_patient_time ON glucose_records(patient_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_glucose_records_type ON glucose_records(patient_id, measurement_type);
CREATE INDEX IF NOT EXISTS idx_medication_logs_med_patient ON medication_logs(medication_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_created ON notifications(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_time ON audit_logs(patient_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifestyle_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if authenticated user belongs to patient family
CREATE OR REPLACE FUNCTION is_family_member(check_patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM family_members
        WHERE patient_id = check_patient_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if authenticated user is family_admin for patient
CREATE OR REPLACE FUNCTION is_family_admin(check_patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM family_members
        WHERE patient_id = check_patient_id
        AND user_id = auth.uid()
        AND role = 'family_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: user can see/edit own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Patient Profiles: members can view; admin can update
CREATE POLICY "Family members can view patient" ON patient_profiles
    FOR SELECT USING (is_family_member(id));
CREATE POLICY "Family admins can update patient" ON patient_profiles
    FOR UPDATE USING (is_family_admin(id));

-- Glucose Records: members can view and insert; admin can update/delete
CREATE POLICY "Family can view glucose records" ON glucose_records
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Family can insert glucose records" ON glucose_records
    FOR INSERT WITH CHECK (is_family_member(patient_id));
CREATE POLICY "Admins can update glucose records" ON glucose_records
    FOR UPDATE USING (is_family_admin(patient_id));
CREATE POLICY "Admins can delete glucose records" ON glucose_records
    FOR DELETE USING (is_family_admin(patient_id));

-- Medications: family can view; admins can insert/update/delete
CREATE POLICY "Family can view medications" ON medications
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Admins can manage medications" ON medications
    FOR ALL USING (is_family_admin(patient_id));

-- Medication Logs: family can view and record
CREATE POLICY "Family can view medication logs" ON medication_logs
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Family can insert medication logs" ON medication_logs
    FOR INSERT WITH CHECK (is_family_member(patient_id));

-- Targets: family can view; admins can configure
CREATE POLICY "Family can view targets" ON glucose_targets
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Admins can configure targets" ON glucose_targets
    FOR ALL USING (is_family_admin(patient_id));

-- Meal & Activity Logs: family can view and insert
CREATE POLICY "Family can view meals" ON meal_logs
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Family can log meals" ON meal_logs
    FOR INSERT WITH CHECK (is_family_member(patient_id));

CREATE POLICY "Family can view activities" ON activity_logs
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Family can log activities" ON activity_logs
    FOR INSERT WITH CHECK (is_family_member(patient_id));

CREATE POLICY "Family can view journals" ON lifestyle_journals
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Family can manage journals" ON lifestyle_journals
    FOR ALL USING (is_family_member(patient_id));

-- Reminders & Notifications: family can view; admins can manage
CREATE POLICY "Family can view reminders" ON reminders
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Admins can manage reminders" ON reminders
    FOR ALL USING (is_family_admin(patient_id));

CREATE POLICY "Family can view notifications" ON notifications
    FOR SELECT USING (is_family_member(patient_id));
CREATE POLICY "Family can update notification status" ON notifications
    FOR UPDATE USING (is_family_member(patient_id));

