import express from 'express'
import helmet from 'helmet'
import logger from '#config/logger.ts'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from '#routes/auth.routes.ts'
import { securityMiddleware } from '#middleware/security.middleware.ts'
import type { RequestHandler } from 'express'
const app = express()

app.use(helmet())
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

type Message = string

app.use(securityMiddleware as RequestHandler)
app.use(
  morgan('combined', {
    stream: {
      write: (message: Message) => logger.info(message.trim()),
    },
  })
)

app.get('/', (req, res) => {
  logger.info('Hello from the application')
  res.send('Hello from the application')
})

app.use('/health', (req, res) =>
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    message: 'Health check',
  })
)
app.get('/api', (req, res) => res.status(200).json({ message: 'API is running' }))
app.use('/api/auth', authRoutes)

export default app
