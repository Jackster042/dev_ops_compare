import type { users } from '#models/user.model.ts'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: number
        email?: string
        role?: string
        createdAt?: Date
        updatedAt?: Date
      }
    }
  }
}
