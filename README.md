# outcasts-bot

Posts [Outcasts](https://highlight.xyz/mint/65c36ebc54235eefb1ccb906) sales on [Farcaster](https://www.farcaster.xyz).

## Architecture

Sales are pushed to this API via [SimpleHash webhooks](https://docs.simplehash.com/reference/webhook-api-overview). NFT and ENS data are then fetched from SimpleHash, Farcaster usernames for the buyer and seller are fetched from [Wield](https://docs.far.quest/reference/get_farcaster-v2-user-by-connected-address), and then the cast is published via Neynar.

I'd like to consolidate the Wield and Neynar dependencies in the future.

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
