-- ============================================================================
-- Family Diabetes Care - Migration: Rename Tables to 'health_' Prefix
-- Enables safe migration for Supabase databases that already ran initial schema
-- ============================================================================

DO $$
BEGIN
    -- 1. Profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        ALTER TABLE profiles RENAME TO health_profiles;
    END IF;

    -- 2. Patient Profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_profiles' AND table_schema = 'public') THEN
        ALTER TABLE patient_profiles RENAME TO health_patient_profiles;
    END IF;

    -- 3. Family Members
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'family_members' AND table_schema = 'public') THEN
        ALTER TABLE family_members RENAME TO health_family_members;
    END IF;

    -- 4. Glucose Targets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'glucose_targets' AND table_schema = 'public') THEN
        ALTER TABLE glucose_targets RENAME TO health_glucose_targets;
    END IF;

    -- 5. Glucose Records
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'glucose_records' AND table_schema = 'public') THEN
        ALTER TABLE glucose_records RENAME TO health_glucose_records;
    END IF;

    -- 6. Medications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medications' AND table_schema = 'public') THEN
        ALTER TABLE medications RENAME TO health_medications;
    END IF;

    -- 7. Medication Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medication_logs' AND table_schema = 'public') THEN
        ALTER TABLE medication_logs RENAME TO health_medication_logs;
    END IF;

    -- 8. Meal Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_logs' AND table_schema = 'public') THEN
        ALTER TABLE meal_logs RENAME TO health_meal_logs;
    END IF;

    -- 9. Activity Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs' AND table_schema = 'public') THEN
        ALTER TABLE activity_logs RENAME TO health_activity_logs;
    END IF;

    -- 10. Lifestyle Journals
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lifestyle_journals' AND table_schema = 'public') THEN
        ALTER TABLE lifestyle_journals RENAME TO health_lifestyle_journals;
    END IF;

    -- 11. Reminders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminders' AND table_schema = 'public') THEN
        ALTER TABLE reminders RENAME TO health_reminders;
    END IF;

    -- 12. Notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        ALTER TABLE notifications RENAME TO health_notifications;
    END IF;

    -- 13. Medical Records
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_records' AND table_schema = 'public') THEN
        ALTER TABLE medical_records RENAME TO health_medical_records;
    END IF;

    -- 14. Audit Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
        ALTER TABLE audit_logs RENAME TO health_audit_logs;
    END IF;
END $$;

-- Update helper functions to reference the new health_family_members table
CREATE OR REPLACE FUNCTION is_family_member(check_patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM health_family_members
        WHERE patient_id = check_patient_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_family_admin(check_patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM health_family_members
        WHERE patient_id = check_patient_id
        AND user_id = auth.uid()
        AND role = 'family_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
