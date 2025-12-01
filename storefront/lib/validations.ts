import { z } from "zod";

// Customer schemas
export const customerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z.string().optional(),
});

export const loginSchema = customerSchema.pick({
  email: true,
  password: true,
});

export const registerSchema = customerSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Address schemas
export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  countryCode: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
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

// Types
export type CustomerInput = z.infer<typeof customerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
