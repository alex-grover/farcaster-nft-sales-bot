import { base } from 'viem/chains'

export function getChain(chain: string) {
  switch (chain) {
    case base.name.toLowerCase():
      return base
    default:
      throw new Error('Unsupported chain')
  }
}
