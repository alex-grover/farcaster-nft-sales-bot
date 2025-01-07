import crypto from 'crypto'
import { Address } from 'viem'
import { env } from '@/lib/env'

type SimpleHashWebhookPayload = {
  data: {
    chain: string
    event_type: 'mint' | 'sale' | 'transfer' | 'burn'
    contract_address: string
    token_id: string | null
    from_address: string | null
    to_address: string | null
    transaction: string
    sale_details: {
      unit_price: number | null
      unit_price_usd_cents: number | null
    } | null
  }
}

export async function verifyWebhook(
  request: Request,
): Promise<
  { valid: false } | { valid: true; data: SimpleHashWebhookPayload['data'] }
> {
  const webhookId = request.headers.get('webhook-id')
  const webhookTimestamp = request.headers.get('webhook-timestamp')
  const webhookSignature = request.headers.get('webhook-signature')

  if (!webhookId || !webhookTimestamp) return { valid: false }

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
    return { valid: false }

  const json = JSON.parse(text) as SimpleHashWebhookPayload

  return { valid: true, data: json.data }
}

type NftResponse = {
  name: string
  previews: {
    image_large_url: string
  }
}

export async function getNft(chain: string, address: Address, tokenId: string) {
  const response = await fetch(
    `https://api.simplehash.com/api/v0/nfts/${chain}/${address}/${tokenId}`,
    {
      headers: {
        'X-API-KEY': env.SIMPLEHASH_API_KEY,
      },
    },
  )

  const json = (await response.json()) as NftResponse

  return {
    name: json.name,
    image: json.previews.image_large_url,
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
