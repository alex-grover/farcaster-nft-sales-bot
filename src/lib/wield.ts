import { Address } from 'viem'

export async function getFarcasterUsername(address: Address, apiKey: string) {
  const params = new URLSearchParams({ address })
  const response = await fetch(
    `https://build.far.quest/farcaster/v2/user-by-connected-address?${params.toString()}`,
    {
      headers: {
        'API-KEY': apiKey,
      },
    },
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await response.json()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (json?.result?.user?.username as string | undefined) ?? null
}
