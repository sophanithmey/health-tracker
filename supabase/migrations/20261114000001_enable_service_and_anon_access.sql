-- ============================================================================
-- Family Diabetes Care - RLS Policies for Server-Side / Anon Access
-- Allows the Next.js server layer to perform CRUD operations on health_* tables
-- ============================================================================

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'health_profiles',
        'health_patient_profiles',
        'health_family_members',
        'health_glucose_targets',
        'health_glucose_records',
        'health_medications',
        'health_medication_logs',
        'health_meal_logs',
        'health_activity_logs',
        'health_lifestyle_journals',
        'health_reminders',
        'health_notifications',
        'health_medical_records',
        'health_audit_logs'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
            EXECUTE format('DROP POLICY IF EXISTS "Allow all for server access" ON %I;', tbl);
            EXECUTE format('CREATE POLICY "Allow all for server access" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
        END IF;
    END LOOP;
END $$;
