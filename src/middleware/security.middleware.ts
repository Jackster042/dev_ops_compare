import aj from '#config/arcjet.ts'
import logger from '#config/logger.ts'
import { slidingWindow } from '@arcjet/bun'
import type { HeadersInit } from 'bun'
import type { NextFunction, Request, Response } from 'express'

export const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.role || 'guest'

    let limit: number = 5
    let message: string = 'Request limit exceeded (5 requests minute). Slow down '

    switch (role) {
      case 'admin':
        limit = 20
        message = 'Admin request limit exceeded (20 requests minute). Slow down '
        break

      case 'user':
        limit = 10
        message = 'User request limit exceeded (10 requests minute). Slow down '
        break

      case 'guest':
        limit = 5
        message = 'Guest request limit exceeded (5 requests minute). Slow down '
        break
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
      })
    )

    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`

    const fetchRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as HeadersInit),
    })

    const decision = await client.protect(fetchRequest)

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      })

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      })
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield Blocked request', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      })

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      })
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      })

      return res.status(403).json({ error: 'Forbidden', message: 'Too many requests' })
    }

    next()
  } catch (error) {
    console.error('Arcjet middleware errror', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    })
  }
}
