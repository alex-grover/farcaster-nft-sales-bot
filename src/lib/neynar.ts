import { NeynarAPIClient } from '@neynar/nodejs-sdk'

export function publishCast(
  text: string,
  url: string,
  image: string,
  apiKey: string,
  signerUuid: string,
) {
  const client = new NeynarAPIClient(apiKey)

  return client.publishCast(signerUuid, text, {
    embeds: [{ url }, { url: image }],
  })
}
