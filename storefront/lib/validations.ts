import { z } from "zod";

// Reusable schema fragments
export const phoneSchema8 = z
  .string()
  .length(8, "Утасны дугаар 8 оронтой байх ёстой")
  .regex(/^\d{8}$/, "Утасны дугаар зөвхөн тоо байх ёстой");

export const phoneSchema8or9 = z
  .string()
  .regex(/^\d{8,9}$/, "Утасны дугаар 8-9 оронтой байх ёстой");

export const phoneSchema8or9Optional = z
  .string()
  .regex(/^(\d{8,9})?$/, "Утасны дугаар 8-9 оронтой байх ёстой")
  .optional();

export const emailSchema = z.string().email("И-мэйл хаяг буруу байна");

export const firstNameSchema = z.string().min(1, "Нэр оруулна уу");

export const lastNameSchema = z.string().min(1, "Овог оруулна уу");

export const passwordSchema = z
  .string()
  .min(8, "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой");

// Contact fields (first name, last name, email, phone)
export const contactFieldsSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  phone: phoneSchema8,
});

// Customer schemas
export const customerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: firstNameSchema.optional(),
  lastName: lastNameSchema.optional(),
  phone: phoneSchema8or9Optional,
});

// Profile update schema (without password)
export const profileUpdateSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: phoneSchema8or9Optional,
});

export const loginSchema = customerSchema.pick({
  email: true,
  password: true,
});

export const registerSchema = customerSchema.extend({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Нууц үг таарахгүй байна",
  path: ["confirmPassword"],
});

// Address schemas
export const addressSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  address1: z.string().min(1, "Хаяг оруулна уу"),
  address2: z.string().optional(),
  city: z.string().min(1, "Хот/Аймаг оруулна уу"),
  province: z.string().optional(),
  countryCode: z.string().min(2, "Улс оруулна уу"),
  phone: phoneSchema8or9,
  company: z.string().optional(),
});

// Cart schemas
export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

export const updateCartItemSchema = z.object({
  lineItemId: z.string().min(1, "Line item ID is required"),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
});

// Checkout schemas
export const shippingAddressSchema = addressSchema;

export const billingAddressSchema = addressSchema;

export const paymentSchema = z.object({
  providerId: z.string().min(1, "Payment provider is required"),
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
});

// Checkout schemas (Mongolian)
export const checkoutContactSchema = contactFieldsSchema;

export const checkoutDeliveryMethodSchema = z.enum(["delivery", "pickup"], {
  message: "Хүргэлтийн төрөл сонгоно уу",
});

export const checkoutAddressSchema = z.object({
  city: z.string().min(1, "Хот/Аймаг сонгоно уу"),
  district: z.string().min(1, "Дүүрэг/Сум оруулна уу"),
  khoroo: z.string().min(1, "Хороо/Баг оруулна уу"),
  street: z.string().min(1, "Гудамж оруулна уу"),
  building: z.string().min(1, "Байрны дугаар оруулна уу"),
  apartment: z.string().min(1, "Тоот оруулна уу"),
  additionalInfo: z.string().optional(),
  countryCode: z.string().default("mn"),
});

export const checkoutPaymentMethodSchema = z.enum(["bank_transfer", "cash_on_delivery", "qpay"], {
  message: "Төлбөрийн хэлбэр сонгоно уу",
});

export const checkoutShippingOptionSchema = z.object({
  shippingOptionId: z.string().min(1, "Хүргэлтийн сонголт сонгоно уу"),
});

// Full checkout form schema
export const checkoutFormSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  phone: phoneSchema8,
  deliveryMethod: checkoutDeliveryMethodSchema,
  shippingAddress: checkoutAddressSchema.optional(),
  shippingOptionId: z.string().optional(),
  paymentMethod: checkoutPaymentMethodSchema,
  notes: z.string().optional(),
}).refine((data) => {
  // If delivery is selected, shipping address is required
  if (data.deliveryMethod === "delivery") {
    return data.shippingAddress !== undefined;
  }
  return true;
}, {
  message: "Хүргэлтийн хаяг оруулна уу",
  path: ["shippingAddress"],
});

// Types
export type CustomerInput = z.infer<typeof customerSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CheckoutContactInput = z.infer<typeof checkoutContactSchema>;
export type CheckoutDeliveryMethod = z.infer<typeof checkoutDeliveryMethodSchema>;
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type CheckoutPaymentMethod = z.infer<typeof checkoutPaymentMethodSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
