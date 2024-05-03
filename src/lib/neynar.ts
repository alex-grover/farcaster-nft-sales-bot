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

const OPTIMISTS_ADDRESS = '0x37a0C3216a09ec87Bb91958ca06065659D80F8DD'
const OUTCASTS_ADDRESS = '0x73682A7f47Cb707C52cb38192dBB9266D3220315'

const SIGNER_UUIDS = new Map<Address, string>([
  [OPTIMISTS_ADDRESS, env.OPTIMISTS_NEYNAR_SIGNER_UUID],
  [OUTCASTS_ADDRESS, env.OUTCASTS_NEYNAR_SIGNER_UUID],
])

const CHANNELS = new Map<Address, string>([[OPTIMISTS_ADDRESS, 'optimists']])

export function publishCast(
  address: Address,
  text: string,
  url: string,
  image: string,
) {
  const signerUuid = SIGNER_UUIDS.get(address)
  if (!signerUuid) throw new Error('Unknown NFT address')

  const channelId = CHANNELS.get(address)

  return client.publishCast(signerUuid, text, {
    embeds: [{ url }, { url: image }],
    channelId,
  })
}
