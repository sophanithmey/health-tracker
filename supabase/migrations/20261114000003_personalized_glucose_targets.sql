-- ============================================================================
-- Migration: Personalized Glucose Targets & Audit Logging
-- Prefix: health_
-- Description: Adds detailed threshold configuration, approval workflow,
--              audit history, and clinician role support.
-- ============================================================================

-- 1. Extend user and family member roles with 'clinician'
ALTER TABLE health_profiles DROP CONSTRAINT IF EXISTS health_profiles_role_check;
ALTER TABLE health_profiles ADD CONSTRAINT health_profiles_role_check 
    CHECK (role IN ('family_admin', 'patient', 'clinician'));

ALTER TABLE health_family_members DROP CONSTRAINT IF EXISTS health_family_members_role_check;
ALTER TABLE health_family_members ADD CONSTRAINT health_family_members_role_check 
    CHECK (role IN ('family_admin', 'patient', 'clinician'));

-- 2. Expand health_glucose_targets table
ALTER TABLE health_glucose_targets 
    ADD COLUMN IF NOT EXISTS min_value NUMERIC(5, 1),
    ADD COLUMN IF NOT EXISTS max_value NUMERIC(5, 1),
    ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'mg/dL',
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'clinician_configured' 
        CHECK (source IN ('general_guideline', 'clinician_configured')),
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (approval_status IN ('pending', 'approved', 'rejected', 'expired')),
    ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS effective_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS guideline_source TEXT DEFAULT 'ADA Standards of Care',
    ADD COLUMN IF NOT EXISTS guideline_version TEXT DEFAULT '2026',
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES health_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES health_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill min_value, max_value, effective_from, approval_status from existing columns if empty
UPDATE health_glucose_targets 
SET 
    min_value = COALESCE(min_value, target_min),
    max_value = COALESCE(max_value, target_max),
    effective_from = COALESCE(effective_from, effective_date),
    approval_status = CASE 
        WHEN clinician_approval_status = 'clinician_approved' THEN 'approved' 
        ELSE 'pending' 
    END
WHERE min_value IS NULL OR max_value IS NULL;

-- 3. Create health_glucose_target_audit_logs table
CREATE TABLE IF NOT EXISTS health_glucose_target_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID REFERENCES health_glucose_targets(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES health_patient_profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'approved', 'rejected', 'expired')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES health_profiles(id),
    changed_by_name TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_health_target_audit_patient 
    ON health_glucose_target_audit_logs(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_target_audit_target 
    ON health_glucose_target_audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_health_glucose_targets_active_type 
    ON health_glucose_targets(patient_id, measurement_type, approval_status, is_active);

-- 4. Row Level Security for health_glucose_target_audit_logs
ALTER TABLE health_glucose_target_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'health_glucose_target_audit_logs' 
        AND policyname = 'Family can view target audit logs'
    ) THEN
        CREATE POLICY "Family can view target audit logs" ON health_glucose_target_audit_logs
            FOR SELECT USING (is_family_member(patient_id));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'health_glucose_target_audit_logs' 
        AND policyname = 'Family and clinicians can insert target audit logs'
    ) THEN
        CREATE POLICY "Family and clinicians can insert target audit logs" ON health_glucose_target_audit_logs
            FOR INSERT WITH CHECK (is_family_member(patient_id));
    END IF;
END $$;
