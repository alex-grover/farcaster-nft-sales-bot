import { Address } from 'viem'

type FarcasterProfileResponse = {
  username: string
}

export async function getFarcasterUsername(address: Address) {
  const response = await fetch(`https://api.ensdata.net/farcaster/${address}`)
  if (!response.ok) return null

  const json = (await response.json()) as FarcasterProfileResponse

  return json.username
}
