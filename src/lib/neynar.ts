import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import { Address } from 'viem'
import { env } from '@/lib/env'

const client = new NeynarAPIClient(env.NEYNAR_API_KEY)

export async function getFarcasterUsername(address: Address) {
  try {
    const response = await client.lookupUserByVerification(address)
    return response.result.user.username
  } catch {
    return null
  }
}

export function publishCast(text: string, url: string, image: string) {
  return client.publishCast(env.NEYNAR_SIGNER_UUID, text, {
    embeds: [{ url }, { url: image }],
  })
}
