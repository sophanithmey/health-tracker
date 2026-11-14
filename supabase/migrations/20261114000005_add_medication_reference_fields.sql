-- ============================================================================
-- Migration: Add optional standardized reference fields to health_medications
-- Allows linking patient prescribed medications to RxNorm / DailyMed concepts.
-- ============================================================================

ALTER TABLE IF EXISTS health_medications
  ADD COLUMN IF NOT EXISTS rxcui TEXT,
  ADD COLUMN IF NOT EXISTS generic_name TEXT,
  ADD COLUMN IF NOT EXISTS brand_name TEXT,
  ADD COLUMN IF NOT EXISTS active_ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS dosage_form TEXT,
  ADD COLUMN IF NOT EXISTS reference_source TEXT;

-- Index for RxCUI lookups
CREATE INDEX IF NOT EXISTS idx_health_medications_rxcui ON health_medications(rxcui);
