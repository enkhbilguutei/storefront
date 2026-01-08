import { z } from "zod";

// Auth validations
export const emailPasswordSchema = z.object({
  email: z.string().email("И-мэйл хаяг буруу байна"),
  password: z.string().min(8, "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой"),
});

export const registerSchema = emailPasswordSchema.extend({
  first_name: z.string().min(1, "Нэр оруулна уу"),
  last_name: z.string().min(1, "Овог оруулна уу"),
});

export const oauthSchema = z.object({
  email: z.string().email("И-мэйл хаяг буруу байна"),
  name: z.string().min(1, "Нэр оруулна уу"),
  provider: z.enum(["google", "facebook"]),
});

// Customer profile validations
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "Нэр оруулна уу"),
  last_name: z.string().min(1, "Овог оруулна уу"),
  phone: z.string().regex(/^\d{8,9}$/, "Утасны дугаар 8-9 оронтой байх ёстой").optional(),
});

// Address validations
export const createAddressSchema = z.object({
  first_name: z.string().min(1, "Нэр оруулна уу"),
  last_name: z.string().min(1, "Овог оруулна уу"),
  phone: z.string().regex(/^\d{8,9}$/, "Утасны дугаар 8-9 оронтой байх ёстой"),
  address_1: z.string().min(1, "Хаяг оруулна уу"),
  address_2: z.string().optional(),
  city: z.string().min(1, "Хот/Аймаг оруулна уу"),
  province: z.string().optional(),
  country_code: z.string().length(2, "Улсын код 2 тэмдэгт байх ёстой"),
});

export const updateAddressSchema = createAddressSchema;

// Wishlist validations
export const addToWishlistSchema = z.object({
  product_id: z.string().min(1, "Барааны ID шаардлагатай"),
  variant_id: z.string().optional(),
});

// Product analytics validations
export const trackViewSchema = z.object({
  product_id: z.string().min(1, "Барааны ID шаардлагатай"),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Үнэлгээ 1-5 хооронд байх ёстой").max(5, "Үнэлгээ 1-5 хооронд байх ёстой"),
  title: z.string().max(100, "Гарчиг 100 тэмдэгтээс хэтрэхгүй байх ёстой").optional(),
  comment: z.string().min(10, "Сэтгэгдэл дор хаяж 10 тэмдэгттэй байх ёстой").max(1000, "Сэтгэгдэл 1000 тэмдэгтээс хэтрэхгүй байх ёстой"),
  photos: z.array(z.string().url("Зураг URL форматтай байх ёстой")).max(5, "5-аас олон зураг оруулах боломжгүй").optional(),
});

// Search validations
export const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  limit: z.string().regex(/^\d+$/).optional().default("20"),
  offset: z.string().regex(/^\d+$/).optional().default("0"),
  collection_id: z.array(z.string()).optional(),
  category_id: z.array(z.string()).optional(),
  price_list_id: z.array(z.string()).optional(),
  region_id: z.string().optional(),
  currency_code: z.string().optional().default("mnt"),
  sort: z.enum(["price_asc", "price_desc", "title_asc", "title_desc", "created_at_desc"]).optional(),
  min_price: z.string().regex(/^\d+$/).optional(),
  max_price: z.string().regex(/^\d+$/).optional(),
});

export const suggestionQuerySchema = z.object({
  q: z.string().optional().default(""),
  limit: z.string().regex(/^\d+$/).optional().default("6"),
});

// QPay validations
export const createQPayInvoiceSchema = z.object({
  order_id: z.string().min(1, "Захиалгын ID шаардлагатай"),
  cart_id: z.string().min(1, "Сагсны ID шаардлагатай"),
  amount: z.number().positive("Дүн эерэг байх ёстой"),
  description: z.string().min(1, "Тайлбар шаардлагатай"),
  customer_email: z.string().email("И-мэйл хаяг буруу байна").optional(),
  customer_phone: z.string().regex(/^\d{8,9}$/, "Утасны дугаар 8-9 оронтой байх ёстой").optional(),
});

export const qpayCallbackSchema = z.object({
  payment_id: z.string().min(1, "Төлбөрийн ID шаардлагатай"),
  qpay_payment_id: z.string().min(1, "QPay төлбөрийн ID шаардлагатай"),
});

// Banner validations (admin)
export const createBannerSchema = z.object({
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().min(1, "Зургийн URL шаардлагатай").refine(
    (val) => {
      // Accept full URLs or Cloudinary public IDs
      if (val.startsWith('http://') || val.startsWith('https://')) {
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      }
      // Accept Cloudinary public IDs (non-URL strings)
      return val.length > 0
    },
    { message: "Зургийн URL буруу байна" }
  ),
  mobile_image_url: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.string().refine(
      (val) => {
        if (val.startsWith('http://') || val.startsWith('https://')) {
          try {
            new URL(val)
            return true
          } catch {
            return false
          }
        }
        return val.length > 0
      },
      { message: "Утасны зургийн URL буруу байна" }
    ).nullable()
  ),
  link: z.string().min(1, "Холбоос шаардлагатай").refine(
    (val) => {
      // Accept relative URLs starting with / or full URLs
      if (val.startsWith('/')) return true
      try {
        new URL(val)
        return true
      } catch {
        return false
      }
    },
    { message: "Холбоос буруу байна. / эсвэл бүтэн URL оруулна уу" }
  ),
  alt_text: z.string().nullable(),
  placement: z.enum(["hero", "bento", "bento_grid", "product_grid"]),
  section: z.string().nullable(), // For product_grid
  grid_size: z.enum(["3x3", "1x1", "2x3"]).default("3x3"), // For bento_grid
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  dark_text: z.boolean().default(false),
  starts_at: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.string().datetime().nullable()
  ),
  ends_at: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.string().datetime().nullable()
  ),
  metadata: z.record(z.unknown()).nullable(),
});

export const updateBannerSchema = createBannerSchema.partial();

// Pricing validations (admin)
export const updatePriceSchema = z.object({
  amount: z.number().positive("Үнэ эерэг байх ёстой"),
  currency_code: z.string().length(3, "Валютын код 3 тэмдэгт байх ёстой").default("mnt"),
});

// Helper function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Helper function to validate query params
export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(query);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Helper to format validation errors for API response
export function formatValidationErrors(errors: z.ZodError): { field: string; message: string }[] {
  return errors.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}
