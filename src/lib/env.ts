import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NEYNAR_API_KEY: z.string().min(1),
    NEYNAR_SIGNER_UUID: z.string().uuid(),
    SIMPLEHASH_API_KEY: z.string().min(1),
    SIMPLEHASH_WEBHOOK_SECRET: z.string().min(1),
  },
  experimental__runtimeEnv: {},
})
