import crypto from 'crypto'
import { Address } from 'viem'
import { base } from 'viem/chains'
import { env } from '@/lib/env'

export async function verifyWebhook(request: Request) {
  const webhookId = request.headers.get('webhook-id')
  const webhookTimestamp = request.headers.get('webhook-timestamp')
  const webhookSignature = request.headers.get('webhook-signature')

  const text = await request.text()

  const signature = crypto
    .createHmac('sha256', Buffer.from(env.SIMPLEHASH_WEBHOOK_SECRET, 'base64'))
    .update(`${webhookId}.${webhookTimestamp}.${text}`)
    .digest('base64')

  if (
    !webhookSignature
      ?.split(' ')
      .map((signature) => signature.split(',').at(1))
      .includes(signature)
  )
    return { valid: false, json: null }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = JSON.parse(text)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return { valid: true, json }
}

type NftResponse = {
  name: string
  image_url: string
}

export async function getNft(address: Address, tokenId: string) {
  const response = await fetch(
    `https://api.simplehash.com/api/v0/nfts/${base.name.toLowerCase()}/${address}/${tokenId}`,
    {
      headers: {
        'X-API-KEY': env.SIMPLEHASH_API_KEY,
      },
    },
  )

  const json = (await response.json()) as NftResponse

  return {
    name: json.name,
    image: json.image_url,
  }
}

type EnsReverseLookupResponse = {
  address: string
  ens: string | null
}[]

export async function getEnsNames(addresses: Address[]) {
  const params = new URLSearchParams({ wallet_addresses: addresses.join(',') })
  const response = await fetch(
    `https://api.simplehash.com/api/v0/ens/reverse_lookup?${params.toString()}`,
    {
      headers: {
        'X-API-KEY': env.SIMPLEHASH_API_KEY,
      },
    },
  )

  const json = (await response.json()) as EnsReverseLookupResponse

  return json.map((item) => item.ens)
}
