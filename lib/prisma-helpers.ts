import { Prisma } from '@prisma/client';

/**
 * Type-safe helper for handling optional JSON fields in Prisma
 * 
 * Prisma's Json? fields have special semantics:
 * - undefined = Don't update the field (omit from query)
 * - Prisma.DbNull = Set to SQL NULL in database
 * - Prisma.JsonNull = JSON null value ({"value": null})
 * - JsonValue = Actual JSON data
 * 
 * @param value - The value from Zod validation (can be T | null | undefined)
 * @returns Prisma-compatible value
 */
export function toOptionalJson<T extends Prisma.InputJsonValue>(
  value: T | null | undefined
): T | typeof Prisma.DbNull | undefined {
  // If explicitly null, set database to NULL
  if (value === null) {
    return Prisma.DbNull;
  }
  // If undefined, omit from update (don't touch the field)
  if (value === undefined) {
    return undefined;
  }
  // Otherwise, use the actual value
  return value as T;
}

/**
 * Type for i18n JSON fields in the database
 */
export type I18nString = {
  en: string;
  es: string;
};

/**
 * Helper to validate i18n string structure at runtime
 */
export function isValidI18nString(value: unknown): value is I18nString {
  return (
    typeof value === 'object' &&
    value !== null &&
    'en' in value &&
    'es' in value &&
    typeof (value as any).en === 'string' &&
    typeof (value as any).es === 'string'
  );
}
