import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Shared i18n validator for multilingual JSON fields
 * Structure: { en: string, es: string }
 */
const i18nStringSchema = z.object({
  en: z.string().min(1, 'English text is required'),
  es: z.string().min(1, 'Spanish text is required'),
});

/**
 * I18n string type for use in TypeScript
 */
export type I18nString = z.infer<typeof i18nStringSchema>;

/**
 * About validators
 * Note: nullable() allows explicit null to clear fields in database
 */
export const updateAboutSchema = z.object({
  title: i18nStringSchema,
  description: i18nStringSchema,
  // Optional fields - null means "set to NULL in DB", undefined means "don't update"
  shortBio: i18nStringSchema.nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  email: z.string().email('Invalid email address').nullable().optional(),
});

export type UpdateAboutInput = z.infer<typeof updateAboutSchema>;

// Project validators

export const createProjectSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: i18nStringSchema,
  description: i18nStringSchema,
  technologies: z.array(z.string()).default([]),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{3,6}$/, 'Invalid hex color').default('#0ff'),
  imageUrl: z.preprocess(
    (val) => val === '' || val === undefined ? null : val,
    z.string().url('Invalid image URL').nullable()
  ).optional().nullable(),
  githubUrl: z.preprocess(
    (val) => val === '' || val === undefined ? null : val,
    z.string().url('Invalid GitHub URL').nullable()
  ).optional().nullable(),
  liveUrl: z.preprocess(
    (val) => val === '' || val === undefined ? null : val,
    z.string().url('Invalid live URL').nullable()
  ).optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Certification validators
export const createCertificationSchema = z.object({
  title: i18nStringSchema,
  issuer: i18nStringSchema, // Required JSON field
  imageUrl: z.string().min(1, 'Image URL is required'),
  credentialUrl: z.preprocess(
    (val) => val === '' || val === undefined ? null : val,
    z.string().url('Invalid credential URL').nullable()
  ).optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const updateCertificationSchema = createCertificationSchema.partial().extend({
  // issuer is required in schema, so when updating it should still be required if provided
  issuer: i18nStringSchema.optional(),
});

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;

// Contact message validators
export const createContactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;

// Generic pagination validator
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
