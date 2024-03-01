import crypto from 'crypto'
import { formatEther, getAddress } from 'viem'
import { base } from 'viem/chains'
import { env } from '@/lib/env'
import { publishCast } from '@/lib/neynar'
import { getEnsNames, getNft } from '@/lib/simplehash'
import { getFarcasterUsername } from '@/lib/wield'

export async function POST(request: Request) {
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
    return new Response('Invalid webhook signature', { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = JSON.parse(text)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    event_type: eventType,
    contract_address: rawAddress,
    token_id: tokenId,
    from_address: rawFromAddress,
    to_address: rawToAddress,
    transaction,
    sale_details: saleDetails,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  } = json.data

  if (eventType !== 'sale') return new Response('Not a sale')

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { unit_price: price, unit_price_usd_cents: priceUsd } = saleDetails

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const address = getAddress(rawAddress)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const nft = await getNft(address, tokenId, env.SIMPLEHASH_API_KEY)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const fromAddress = getAddress(rawFromAddress)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const toAddress = getAddress(rawToAddress)

  const [fromFname, toFname] = await Promise.all([
    getFarcasterUsername(fromAddress, env.WIELD_API_KEY),
    getFarcasterUsername(toAddress, env.WIELD_API_KEY),
  ])

  const [fromEns, toEns] = await getEnsNames(
    [fromAddress, toAddress],
    env.SIMPLEHASH_API_KEY,
  )

  const fromName = fromFname ? `@${fromFname}` : fromEns ?? fromAddress
  const toName = toFname ? `@${toFname}` : toEns ?? toAddress

  // TODO: optionally publish in channel

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await publishCast(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    `${fromName} sold ${nft.name} to ${toName} for ${formatEther(BigInt(price))} ETH (${new Intl.NumberFormat(
      'en-US',
      { style: 'currency', currency: 'USD' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ).format(priceUsd / 100)})`,
    `${base.blockExplorers.default.url}/tx/${transaction}`,
    nft.image,
    env.NEYNAR_API_KEY,
    env.NEYNAR_SIGNER_UUID,
  )

  return new Response('Success')
}
