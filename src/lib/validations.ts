import { z } from "zod";

export const settingsSchema = z.object({
  restaurantName: z.string().min(1, "اسم المتجر مطلوب"),
  address: z.string().optional(),
  mapUrl: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  currency: z.string().default("IQD"),
  logoUrl: z.string().optional(),
  mode: z.enum(["dine-in", "delivery"]).default("dine-in"),
  isOpen: z.boolean().default(true),
  extraInfo: z.string().optional(),
  messageFooter: z.string().optional(),
});

export const categorySchema = z.object({
  name_ar: z.string().min(1, "اسم الفئة مطلوب"),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const itemSchema = z.object({
  name_ar: z.string().min(1, "اسم الصنف مطلوب"),
  desc_ar: z.string().optional().default(""),
  priceInt: z.number().int().min(0, "السعر يجب أن يكون موجباً"),
  oldPriceInt: z.number().int().min(0).optional().nullable(),
  categoryId: z.string().min(1, "الفئة مطلوبة"),
  imagePath: z.string().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const setupSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});
