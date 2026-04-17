import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export const registerSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.email(),
  address: z.string().min(1).max(400),
  password: z.string().regex(passwordRegex),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const createUserByAdminSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.email(),
  address: z.string().min(1).max(400),
  password: z.string().regex(passwordRegex),
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"]),
});

export const createStoreSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  address: z.string().min(1).max(400),
  ownerId: z.number().int().positive(),
});

export const ratingSchema = z.object({
  storeId: z.number().int().positive(),
  value: z.number().int().min(1).max(5),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().regex(passwordRegex),
});

export const filterSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
