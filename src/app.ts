import express from 'express'
import helmet from 'helmet'
import logger from '#config/logger.ts'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(helmet())
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

type Message = string

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

export default app
