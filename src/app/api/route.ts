import { formatEther, getAddress } from 'viem'
import { shortenAddress } from '@/lib/address'
import { getFarcasterUsername } from '@/lib/farcaster'
import { publishCast } from '@/lib/neynar'
import { getEnsNames, getNft, verifyWebhook } from '@/lib/simplehash'

export async function POST(request: Request) {
  const webhook = await verifyWebhook(request)

  if (!webhook.valid)
    return new Response('Invalid webhook signature', { status: 401 })

  const {
    chain,
    event_type: eventType,
    contract_address: rawAddress,
    token_id: tokenId,
    from_address: rawFromAddress,
    to_address: rawToAddress,
    sale_details: saleDetails,
  } = webhook.data

  if (eventType !== 'sale') return new Response('Not a sale')
  if (!saleDetails?.unit_price || !saleDetails.unit_price_usd_cents)
    return new Response('Invalid sale details')
  if (!tokenId) return new Response('Invalid token ID')
  if (!rawFromAddress) return new Response('Invalid from address')
  if (!rawToAddress) return new Response('Invalid to address')

  const { unit_price: price, unit_price_usd_cents: priceUsd } = saleDetails

  const address = getAddress(rawAddress)
  const fromAddress = getAddress(rawFromAddress)
  const toAddress = getAddress(rawToAddress)

  const [nft, fromFname, toFname, [fromEns, toEns]] = await Promise.all([
    getNft(chain, address, tokenId),
    getFarcasterUsername(fromAddress),
    getFarcasterUsername(toAddress),
    getEnsNames([fromAddress, toAddress]),
  ])

  const fromName = fromFname
    ? `@${fromFname}`
    : fromEns ?? shortenAddress(fromAddress)
  const toName = toFname ? `@${toFname}` : toEns ?? shortenAddress(toAddress)

  await publishCast(
    address,
    `${fromName} sold ${nft.name} to ${toName} for ${formatEther(BigInt(price))} ETH (${new Intl.NumberFormat(
      'en-US',
      { style: 'currency', currency: 'USD' },
    ).format(priceUsd / 100)})`,
    `https://opensea.io/assets/base/${address}/${tokenId}`,
    nft.image,
  )

  return new Response('Success', { status: 201 })
}
