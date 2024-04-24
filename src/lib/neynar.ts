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

const SIGNER_UUIDS: Record<Address, string> = {
  '0x37a0C3216a09ec87Bb91958ca06065659D80F8DD':
    env.OPTIMISTS_NEYNAR_SIGNER_UUID,
  '0x73682A7f47Cb707C52cb38192dBB9266D3220315': env.OUTCASTS_NEYNAR_SIGNER_UUID,
}

export function publishCast(
  address: Address,
  text: string,
  url: string,
  image: string,
) {
  const signerUuid = SIGNER_UUIDS[address]
  if (!signerUuid) throw new Error('Unknown NFT address')

  return client.publishCast(signerUuid, text, {
    embeds: [{ url }, { url: image }],
  })
}
