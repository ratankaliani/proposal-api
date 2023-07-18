
# API

## Add Protocols to the API

Create a method to query proposals from an API endpoint, [similar to this for Aave](https://github.com/ratankaliani/proposal-api/blob/main/pages/api/proposal.js#L80).

Add platform title [here](https://github.com/ratankaliani/proposal-api/blob/main/pages/api/proposal.js#L50).

Test in local dev environment to see if the API (localhost:3000/api/proposal) is receiving proposals from the new protocol.


## Query Parameters

### blockNumber (optional) 

### platforms (optional) [Aave, Compound, Uniswap]

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

# Testing

## Local Testing

First, run the development server to query proposals:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes] The API can be found at http://localhost:3000/api/proposal

# Frontend

TBD!


# Deployment

## Deploy on Vercel

Currently deployment is at https://proposal-api.vercel.app/
