/**
 * Data Validation Schemas using Zod
 * Ensures data integrity for emissions tracking
 */

import { z } from 'zod';

// ============================================================================
// EMISSION DATA VALIDATION
// ============================================================================

export const EmissionInputSchema = z.object({
  scope: z.enum(['Scope 1', 'Scope 2', 'Scope 3'], {
    message: 'Please select a valid emission scope (Scope 1, 2, or 3)',
  }),

  category: z.string().min(1, 'Category is required'),

  activity: z.string().min(3, 'Activity description must be at least 3 characters')
    .max(500, 'Activity description must be less than 500 characters'),

  source: z.string().min(1, 'Source is required'),

  quantity: z.number({
    message: 'Quantity must be a valid number',
  })
    .positive('Quantity must be greater than 0')
    .finite('Quantity must be a finite number')
    .max(1000000000, 'Quantity is unreasonably large'),

  unit: z.string().min(1, 'Unit is required'),

  emissionFactorId: z.string().min(1, 'Please select a valid emission factor'),

  date: z.coerce.date({
    message: 'Please select a valid date',
  })
    .max(new Date(), 'Date cannot be in the future')
    .min(new Date('1900-01-01'), 'Date is too far in the past'),

  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type EmissionInputType = z.infer<typeof EmissionInputSchema>;

// ============================================================================
// EMISSION UPDATE VALIDATION (partial updates allowed)
// ============================================================================

export const EmissionUpdateSchema = EmissionInputSchema.partial().extend({
  id: z.string().min(1, 'Emission ID is required for updates'),
});

export type EmissionUpdateType = z.infer<typeof EmissionUpdateSchema>;

// ============================================================================
// BULK IMPORT VALIDATION
// ============================================================================

export const BulkEmissionImportSchema = z.array(EmissionInputSchema).min(1, 'At least one emission record is required');

export type BulkEmissionImportType = z.infer<typeof BulkEmissionImportSchema>;

// ============================================================================
// QUERY/FILTER VALIDATION
// ============================================================================

export const EmissionFilterSchema = z.object({
  scope: z.enum(['Scope 1', 'Scope 2', 'Scope 3']).optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minCO2e: z.number().optional(),
  maxCO2e: z.number().optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  search: z.string().optional(), // General search term
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'co2e', 'createdAt', 'scope']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type EmissionFilterType = z.infer<typeof EmissionFilterSchema>;

// ============================================================================
// USER VALIDATION (Enhanced from existing auth)
// ============================================================================

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  organizationDescription: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type UserRegistrationType = z.infer<typeof UserRegistrationSchema>;

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type UserLoginType = z.infer<typeof UserLoginSchema>;

export const UserUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type UserUpdateType = z.infer<typeof UserUpdateSchema>;

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordChangeType = z.infer<typeof PasswordChangeSchema>;

// ============================================================================
// ORGANIZATION VALIDATION
// ============================================================================

export const OrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export type OrganizationType = z.infer<typeof OrganizationSchema>;

// ============================================================================
// DATE RANGE VALIDATION
// ============================================================================

export const DateRangeSchema = z.object({
  startDate: z.coerce.date({
    message: 'Start date is required',
  }),
  endDate: z.coerce.date({
    message: 'End date is required',
  }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

export type DateRangeType = z.infer<typeof DateRangeSchema>;

// ============================================================================
// REPORT GENERATION VALIDATION
// ============================================================================

export const ReportGenerationSchema = z.object({
  title: z.string().min(1, 'Report title is required').max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  scope: z.array(z.enum(['Scope 1', 'Scope 2', 'Scope 3'])).min(1, 'Select at least one scope'),
  includeCharts: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  format: z.enum(['pdf', 'csv', 'excel']).default('pdf'),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

export type ReportGenerationType = z.infer<typeof ReportGenerationSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely parse and validate data with Zod
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result;
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  return formattedErrors;
}

/**
 * Validate emission input and return formatted errors if invalid
 */
export function validateEmissionInput(data: unknown): {
  isValid: boolean;
  data?: EmissionInputType;
  errors?: Record<string, string>;
} {
  const result = safeValidate(EmissionInputSchema, data);

  if (result.success) {
    return { isValid: true, data: result.data };
  } else {
    return { isValid: false, errors: formatZodErrors(result.error) };
  }
}
