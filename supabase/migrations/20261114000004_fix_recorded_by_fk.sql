-- Migration: Fix foreign key constraints on recorded_by and user audit columns
-- Allows health glucose records, targets, and logs to be persisted reliably 
-- even if auth.users / health_profiles are not populated or running under family/caregiver sessions.

-- 1. health_glucose_records
ALTER TABLE IF EXISTS health_glucose_records DROP CONSTRAINT IF EXISTS health_glucose_records_recorded_by_fkey;
ALTER TABLE IF EXISTS health_glucose_records ALTER COLUMN recorded_by DROP NOT NULL;

-- 2. health_medication_logs
ALTER TABLE IF EXISTS health_medication_logs DROP CONSTRAINT IF EXISTS health_medication_logs_recorded_by_fkey;
ALTER TABLE IF EXISTS health_medication_logs ALTER COLUMN recorded_by DROP NOT NULL;

-- 3. health_meal_logs
ALTER TABLE IF EXISTS health_meal_logs DROP CONSTRAINT IF EXISTS health_meal_logs_recorded_by_fkey;
ALTER TABLE IF EXISTS health_meal_logs ALTER COLUMN recorded_by DROP NOT NULL;

-- 4. health_activity_logs
ALTER TABLE IF EXISTS health_activity_logs DROP CONSTRAINT IF EXISTS health_activity_logs_recorded_by_fkey;
ALTER TABLE IF EXISTS health_activity_logs ALTER COLUMN recorded_by DROP NOT NULL;

-- 5. health_lifestyle_journals
ALTER TABLE IF EXISTS health_lifestyle_journals DROP CONSTRAINT IF EXISTS health_lifestyle_journals_recorded_by_fkey;
ALTER TABLE IF EXISTS health_lifestyle_journals ALTER COLUMN recorded_by DROP NOT NULL;

-- 6. health_glucose_targets
ALTER TABLE IF EXISTS health_glucose_targets DROP CONSTRAINT IF EXISTS health_glucose_targets_configured_by_fkey;
ALTER TABLE IF EXISTS health_glucose_targets DROP CONSTRAINT IF EXISTS health_glucose_targets_created_by_fkey;
ALTER TABLE IF EXISTS health_glucose_targets DROP CONSTRAINT IF EXISTS health_glucose_targets_approved_by_fkey;

-- 7. health_glucose_target_audit_logs
ALTER TABLE IF EXISTS health_glucose_target_audit_logs DROP CONSTRAINT IF EXISTS health_glucose_target_audit_logs_changed_by_fkey;

-- 8. health_notifications
ALTER TABLE IF EXISTS health_notifications DROP CONSTRAINT IF EXISTS health_notifications_acknowledged_by_fkey;

