// ============================================================================
// Medication Module Zod Validation Schemas
// Request validation for search, RxCUI queries, label lookups, and medication creation.
// ============================================================================

import { z } from 'zod';

export const MedicationSearchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query cannot exceed 100 characters'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().positive().max(50))
});

export const RxCuiParamSchema = z.object({
  rxcui: z
    .string()
    .trim()
    .min(1, 'RxCUI identifier is required')
    .regex(/^[0-9]+$/, 'RxCUI must be a numeric concept identifier')
});

export const SetIdParamSchema = z.object({
  setId: z
    .string()
    .trim()
    .min(1, 'Set ID is required')
});

export const PatientMedicationWithRefSchema = z.object({
  patientId: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Medication name is required').max(150),
  dosage: z.string().trim().min(1, 'Dosage is required').max(100),
  frequency: z.string().trim().min(1, 'Frequency is required').max(100),
  timingInstructions: z.string().trim().max(255).optional(),
  prescribingDoctor: z.string().trim().max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid start date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid end date format (YYYY-MM-DD)').optional().nullable(),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional(),
  // Reference integration fields
  rxcui: z.string().trim().optional(),
  genericName: z.string().trim().optional(),
  brandName: z.string().trim().optional(),
  activeIngredients: z.array(z.string().trim()).optional(),
  dosageForm: z.string().trim().optional(),
  referenceSource: z.string().trim().optional()
});
