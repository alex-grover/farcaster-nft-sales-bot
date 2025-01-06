import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import { Address } from 'viem'
import { env } from '@/lib/env'

const client = new NeynarAPIClient(env.NEYNAR_API_KEY)

const OPTIMISTS_ADDRESS = '0x37a0C3216a09ec87Bb91958ca06065659D80F8DD'
const HIGHER_SELF_ADDRESS = '0xc49Bae5D82644f607eaC97bE42d5188a51cb0CAF'

const SIGNER_UUIDS = new Map<Address, string>([
  [OPTIMISTS_ADDRESS, env.OPTIMISTS_NEYNAR_SIGNER_UUID],
  [HIGHER_SELF_ADDRESS, env.OPTIMISTS_NEYNAR_SIGNER_UUID],
])

const CHANNELS = new Map<Address, string>([
  [OPTIMISTS_ADDRESS, 'optimists'],
  [HIGHER_SELF_ADDRESS, 'optimists'],
])

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
