import { z } from "zod";

export const zSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),

  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, { message: "Lowercase required" })
    .regex(/[A-Z]/, { message: "Uppercase required" })
    .regex(/[0-9]/, { message: "Number required" }),

  username: z.string().min(3).max(30),

  // NEW: Media Fields
  title: z.string().min(1, "Title is required").max(100),
  alt: z.string().min(1, "Alt text is required for SEO").max(200),

  // NEW: Coupon Fields
  code: z.string().min(3, "Code too short").max(20).toUpperCase(),
  discountPercentage: z.coerce.number().min(1).max(100),
  minShoppingAmount: z.coerce.number().min(0)
});