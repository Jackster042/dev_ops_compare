import 'dotenv/config'

export default {
  schema: './src/models/*.model.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
}
