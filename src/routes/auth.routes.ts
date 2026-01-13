import { sighup } from '#controllers/auth.controller.ts'
import express from 'express'
const router = express.Router()

router.post('/sign-up', sighup)

router.post('/sign-in', (req, res) => res.send('POST /api/auth/sign-in: Sign in functionality'))

router.post('/sign-out', (req, res) => res.send('POST /api/auth/sign-out: Sign out functionality'))

router.post('/refresh-token', (req, res) =>
  res.send('POST /api/auth/refresh-token: Refresh token functionality')
)

router.post('/forgot-password', (req, res) =>
  res.send('POST /api/auth/forgot-password: Forgot password functionality')
)

router.post('/reset-password', (req, res) =>
  res.send('POST /api/auth/reset-password: Reset password functionality')
)

export default router
