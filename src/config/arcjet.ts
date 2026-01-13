import arcjet, { detectBot, shield, tokenBucket, slidingWindow } from '@arcjet/bun'
import { env } from 'bun'

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '2s',
      max: 5,
    }),
  ],
})

export default aj
