import type { NextFunction, Request, Response } from 'express'
import logger from '#config/logger.ts'
import { signInSchema, signUpSchema } from '#validations/auth.validation.ts'
import { formatValidations } from '#utils/format.ts'
import { authenticateUser, createUser } from '#services/auth.service.ts'
import { jwtToken } from '#utils/jwt.ts'
import { cookies } from '#utils/cookies.ts'

export const sighup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidations(validationResult.error),
      })
    }

    const { name, email, role, password } = validationResult.data

    const user = await createUser({ name, email, password, role })

    const token = jwtToken.sign({ id: user?.id, role: user?.role, email: user?.email })

    cookies.set(res, 'token', token)

    logger.info(`User signed up successfully: ${name} - ${email} - ${role}`)
    res.status(201).json({
      message: 'User signed up successfully',
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
    })
  } catch (error) {
    logger.error('Error signing up', error)
    if ((error as Error)?.message === 'User with this email already exists`') {
      return res.status(409).json({ error: 'User with this email already exists' })
    }
    next(error)
  }
}

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = signInSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidations(validationResult.error),
      })
    }

    const { email, password } = validationResult.data

    const user = await authenticateUser({ email, password })

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    cookies.set(res, 'token', token)

    logger.info(`User signed in successfully: ${email}`)
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error('Error signing in', error)

    if (
      (error as Error)?.message === 'User not found' ||
      (error as Error)?.message === 'Invalid password'
    ) {
      return res.status(401).json({ error: (error as Error)?.message })
    }

    next(error)
  }
}

export const signOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    cookies.clear(res, 'token')

    logger.info('User signed out successfully')
    res.status(200).json({
      message: 'User signed out successfully',
    })
  } catch (error) {
    logger.error('Sign out error', error)
    next(error)
  }
}
