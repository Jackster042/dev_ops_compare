import logger from '#config/logger.ts'
import bcrypt from 'bcrypt'
import { users } from '#models/user.model.ts'
import { eq } from 'drizzle-orm'
import { db } from '#config/database.ts'

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    logger.error('Error hashing password', error)
    throw new Error('Error hashing password')
  }
}

export const comparePassword = async (password: string, hashedPassword: string) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    logger.error(`Error comparing password: ${error}`)
    throw new Error('Error comparing password')
  }
}

export const createUser = async ({
  name,
  email,
  password,
  role = 'user',
}: {
  name: string
  email: string
  password: string
  role: string
}) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) throw new Error('User with this email already exists')

    const password_hash = await hashPassword(password)

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: password_hash,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

    logger.info(
      `User created successfully: ${newUser?.name} - ${newUser?.email} - ${newUser?.role}`
    )
    return newUser
  } catch (error) {
    logger.error('Error creating user', error)
    throw new Error('Error creating user')
  }
}

export const authenticateUser = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!existingUser) throw new Error('User not found')

    const isPasswordValid = await comparePassword(password, existingUser.password)
    if (!isPasswordValid) throw new Error('Invalid password')

    logger.info(`User ${existingUser.email} authenticated successfully`)
    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
    }
  } catch (error) {
    logger.error('Error authenticating user', error)
    throw new Error('Invalid email or password')
  }
}
