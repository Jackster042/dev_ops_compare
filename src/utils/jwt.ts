import logger from '#config/logger.ts'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET! || 'your-secret-key-please-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN! || '1h'

export const jwtToken = {
  sign: (payload: any) => {
    try {
      return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      })
    } catch (error) {
      logger.error('Error signing JWT token', error)
      throw new Error('Error signing JWT token')
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET as jwt.Secret)
    } catch (error) {
      logger.error('Error verifying JWT token', error)
      throw new Error('Error verifying JWT token')
    }
  },
}
