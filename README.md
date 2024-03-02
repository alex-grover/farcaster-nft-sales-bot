# outcasts-bot

Posts [Outcasts](https://highlight.xyz/mint/65c36ebc54235eefb1ccb906) sales on [Farcaster](https://www.farcaster.xyz).

## Architecture

Sales are pushed to this API via [SimpleHash webhooks](https://docs.simplehash.com/reference/webhook-api-overview). NFT and ENS data are then fetched from SimpleHash, and Farcaster usernames and cast publishing are handled with [Neynar](https://neynar.com).

## Getting started

```sh
pnpm install
pnpm vercel link
pnpm vercel env pull
pnpm dev
```

## Setup

Set up a SimpleHash webhook as indicated here: https://docs.simplehash.com/reference/create-webhook

It should be easy to spin this up for a different NFT collection in the future - you'll just need to have a Farcaster account for the bot, create a Neynar signer, and set up the SimpleHash webhook with a different contract address.
