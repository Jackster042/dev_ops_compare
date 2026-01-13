import { z } from 'zod'

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name must be less than 255 characters' })
    .trim(),
  email: z
    .string()
    .max(255, { message: 'Email must be less than 255 characters' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 8 characters long' })
    .max(255, { message: 'Password must be less than 255 characters' })
    .trim(),
  role: z.enum(['admin', 'user'], { message: 'Invalid role' }).default('user'),
})

export const signInSchema = z.object({
  email: z
    .string()
    .max(255, { message: 'Email must be less than 255 characters' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 8 characters long' })
    .max(255, { message: 'Password must be less than 255 characters' })
    .trim(),
})

export const signOutSchema = z.object({})
