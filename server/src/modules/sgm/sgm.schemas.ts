import { z } from "zod";

export const listMachinesQuerySchema = z.object({
  siteId: z.string().uuid().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const machineIdParamSchema = z.string().uuid();

export function parseMachineIdParam(
  value: string
): { ok: true; machineId: string } | { ok: false; message: string } {
  const result = machineIdParamSchema.safeParse(value);
  if (result.success) return { ok: true, machineId: result.data };
  return { ok: false, message: "Invalid machineId" };
}

export const siteIdParamSchema = z.string().uuid();

export function parseSiteIdParam(
  value: string
): { ok: true; siteId: string } | { ok: false; message: string } {
  const result = siteIdParamSchema.safeParse(value);
  if (result.success) return { ok: true, siteId: result.data };
  return { ok: false, message: "Invalid siteId" };
}

const optionalTrimmedNullable = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const t = v.trim();
    return t === "" ? null : t;
  });

const optionalImageUrl = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const t = v.trim();
    return t === "" ? null : t;
  })
  .superRefine((val, ctx) => {
    if (val == null) return;
    try {
      const u = new URL(val);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid imageUrl" });
      }
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid imageUrl" });
    }
  });

export const createMachineBodySchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  code: optionalTrimmedNullable,
  description: optionalTrimmedNullable,
  imageUrl: optionalImageUrl,
});

export const updateMachineBodySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    code: optionalTrimmedNullable,
    description: optionalTrimmedNullable,
    imageUrl: optionalImageUrl,
  })
  .refine((obj) => Object.keys(obj).some((k) => obj[k as keyof typeof obj] !== undefined), {
    message: "At least one field is required",
  });

export type CreateMachineBody = z.infer<typeof createMachineBodySchema>;
export type UpdateMachineBody = z.infer<typeof updateMachineBodySchema>;

export const qrInventoryQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  assetType: z.string().optional(),
});

export const timelineQuerySchema = z.object({
  eventType: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ListMachinesQuery = z.infer<typeof listMachinesQuerySchema>;
export type QrInventoryQuery = z.infer<typeof qrInventoryQuerySchema>;
export type TimelineQuery = z.infer<typeof timelineQuerySchema>;

const uuidParamSchema = z.string().uuid();

export function parseVisualPointIdParam(value: string): { ok: true; visualPointId: string } | { ok: false; message: string } {
  const result = uuidParamSchema.safeParse(value);
  if (result.success) return { ok: true, visualPointId: result.data };
  return { ok: false, message: "Invalid visualPointId" };
}

export function parseAssetIdParam(
  value: string
): { ok: true; assetId: string } | { ok: false; message: string } {
  const result = uuidParamSchema.safeParse(value);
  if (result.success) return { ok: true, assetId: result.data };
  return { ok: false, message: "Invalid assetId" };
}

export const createVisualPointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  label: z.string().optional(),
});

export type CreateVisualPointBody = z.infer<typeof createVisualPointSchema>;

export const updateVisualPointSchema = z.object({
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  label: z.string().optional(),
});

export type UpdateVisualPointBody = z.infer<typeof updateVisualPointSchema>;

export const linkVisualPointSchema = z.object({
  assetNodeId: z.string().uuid(),
});

export type LinkVisualPointBody = z.infer<typeof linkVisualPointSchema>;

export const createAssetFromVisualPointSchema = z.object({
  name: z.string().min(1),
  nodeType: z.string().min(1),
  description: z.string().optional().nullable(),
  parentId: z.string().uuid().nullable().optional(),
});

export type CreateAssetFromVisualPointBody = z.infer<typeof createAssetFromVisualPointSchema>;

export const ASSET_EVENT_TYPES = [
  "INSTALL",
  "REPLACE",
  "INSPECTION",
  "ADJUSTMENT",
  "CLEANING",
  "FAILURE",
  "NOTE",
] as const;

export const assetEventTypeSchema = z.enum(ASSET_EVENT_TYPES);

export const assetEventCalendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "eventDate must be YYYY-MM-DD")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, "Invalid eventDate");

const observationField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const t = v.trim();
    return t === "" ? null : t;
  });

const usefulLifeDaysField = z
  .union([z.number().int().min(0), z.null()])
  .optional();

export const createAssetEventBodySchema = z.object({
  eventType: assetEventTypeSchema,
  eventDate: assetEventCalendarDateSchema,
  observation: observationField,
  usefulLifeDays: usefulLifeDaysField,
});

export const updateAssetEventBodySchema = z
  .object({
    eventType: assetEventTypeSchema.optional(),
    eventDate: assetEventCalendarDateSchema.optional(),
    observation: observationField,
    usefulLifeDays: usefulLifeDaysField,
  })
  .refine(
    (obj) =>
      obj.eventType !== undefined ||
      obj.eventDate !== undefined ||
      obj.observation !== undefined ||
      obj.usefulLifeDays !== undefined,
    { message: "At least one field is required" }
  );

export type CreateAssetEventBody = z.infer<typeof createAssetEventBodySchema>;
export type UpdateAssetEventBody = z.infer<typeof updateAssetEventBodySchema>;

export function parseEventIdParam(
  value: string
): { ok: true; eventId: string } | { ok: false; message: string } {
  const result = uuidParamSchema.safeParse(value);
  if (result.success) return { ok: true, eventId: result.data };
  return { ok: false, message: "Invalid eventId" };
}
