import { Address } from 'viem'
import { base } from 'viem/chains'

type NftResponse = {
  name: string
  image_url: string
}

export async function getNft(
  address: Address,
  tokenId: string,
  apiKey: string,
) {
  const response = await fetch(
    `https://api.simplehash.com/api/v0/nfts/${base.name.toLowerCase()}/${address}/${tokenId}`,
    {
      headers: {
        'X-API-KEY': apiKey,
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

export async function getEnsNames(addresses: Address[], apiKey: string) {
  const params = new URLSearchParams({ wallet_addresses: addresses.join(',') })
  const response = await fetch(
    `https://api.simplehash.com/api/v0/ens/reverse_lookup?${params.toString()}`,
    {
      headers: {
        'X-API-KEY': apiKey,
      },
    },
  )

  const json = (await response.json()) as EnsReverseLookupResponse

  return json.map((item) => item.ens)
}
