-- ============================================================================
-- Family Diabetes Care - Clear Seed Data
-- Safely removes all seed data and mock records from Supabase
-- ============================================================================

DO $$
DECLARE
    v_patient_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    v_med_id UUID := 'd4e5f6a7-b8c9-0123-def1-234567890123';
BEGIN
    -- 1. Remove by Seed Patient ID (Foreign keys cascade to targets, meds, reminders, logs)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_patient_profiles' AND table_schema = 'public') THEN
        DELETE FROM health_patient_profiles WHERE id = v_patient_id;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_profiles' AND table_schema = 'public') THEN
        DELETE FROM patient_profiles WHERE id = v_patient_id;
    END IF;

    -- 2. Clean any orphaned seed medications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_medications' AND table_schema = 'public') THEN
        DELETE FROM health_medications WHERE id = v_med_id OR patient_id = v_patient_id;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medications' AND table_schema = 'public') THEN
        DELETE FROM medications WHERE id = v_med_id OR patient_id = v_patient_id;
    END IF;

    -- 3. Clean any orphaned seed reminders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_reminders' AND table_schema = 'public') THEN
        DELETE FROM health_reminders WHERE patient_id = v_patient_id;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminders' AND table_schema = 'public') THEN
        DELETE FROM reminders WHERE patient_id = v_patient_id;
    END IF;

    -- 4. Clean any orphaned seed targets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_glucose_targets' AND table_schema = 'public') THEN
        DELETE FROM health_glucose_targets WHERE patient_id = v_patient_id;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'glucose_targets' AND table_schema = 'public') THEN
        DELETE FROM glucose_targets WHERE patient_id = v_patient_id;
    END IF;
END $$;
