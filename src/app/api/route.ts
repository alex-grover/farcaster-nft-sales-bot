import { formatEther, getAddress } from 'viem'
import { base } from 'viem/chains'
import { getFarcasterUsername, publishCast } from '@/lib/neynar'
import { getEnsNames, getNft, verifyWebhook } from '@/lib/simplehash'

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { valid, json } = await verifyWebhook(request)

  if (!valid) return new Response('Invalid webhook signature', { status: 401 })

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
  const nft = await getNft(address, tokenId)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const fromAddress = getAddress(rawFromAddress)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const toAddress = getAddress(rawToAddress)

  const [fromFname, toFname] = await Promise.all([
    getFarcasterUsername(fromAddress),
    getFarcasterUsername(toAddress),
  ])

  const [fromEns, toEns] = await getEnsNames([fromAddress, toAddress])

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
  )

  return new Response('Success', { status: 201 })
}
