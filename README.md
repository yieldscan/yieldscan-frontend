# YieldScan

Maximizing staking yield on substrate based networks(supported networks: Kusama and Polkadot). Currently, the app can be used on https://yieldscan.app .

## Table of contents

- [Currently supported networks](#supported_networks)
- [Description](#description)
- [Development](#development)
  - [Contribution Guide](#contribution_guide)
  - [Codebase Overview](#codebase_verview)
  - [Pre-requisites](#pre-requisites)
  - [Development guide](#development_guide)
- [Gratitude](#gratitude)

## Currently supported networks: <a name = "supported_networks"></a>

- [Kusama Network](https://kusama.network/)
- [Polkadot Network](https://polkadot.network/)

## Description: <a name = "description"></a>

[YieldScan](https://yieldscan.app) is a portfolio management platform for NPoS (nominated proof-of-stake) networks like Kusama and Polkadot. We aim to simplify portfolio management to make yield optimization easier and more accessible, for technical and non-technical users alike.

This project is funded and supported by the [Web3 Foundation](https://web3.foundation/) - under [Wave 6](https://github.com/w3f/General-Grants-Program/blob/master/grants/accepted_grant_applications.md#wave-6).

## Development: <a name = "development"></a>

We are always working on improving our codebase, and welcome any suggestions or contributions.

### Contribution Guide: <a name = 'contribution_guide'></a>

1. Create an issue for the improvement.

2. Fork the repo and make changes. Make sure to checkout from develop branch before starting.

3. Make a PR to `develop` branch.

### Codebase Overview: <a name = 'codebase_overview'></a>

Important packages:

- [components/overview](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview): User profile dashboard module. Overview page displays staked amount, nominated validators and estimated APY, it also handles bond-extra, rebond and withdraw operations for the nominator/user.
- [components/reward-calculator](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/reward-calculator): Reward calulator module. Reward calculator page displays different estimated max yields based on risk-score.
- [components/setup-accounts](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/setup-accounts): Setup accounts module. User flow for setting up accounts for identifying ledger and browser accounts.
- [components/staking](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/staking): Staking module. This module handles different staking flows for different cases.

- [components/validators](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview): validators page module.

### Pre-requisites: <a name = 'pre-requisites'></a>

- [yieldscan-crawler](https://github.com/yieldscan/yieldscan-backend-crawler)
- [yieldscan-api](https://github.com/yieldscan/yieldscan-backend-api)

### Development guide: <a name='development_guide'></a>

- Clone this or forked repository:
  ```bash
  git clone https://github.com/yieldscan/yieldscan-frontend.git
  ```
- Install the dependencies:
  ```bash
  yarn
  ```
- Add environment variables in `.env.local` or `.env` file:

  ```env
  # Main API endpoint
  NEXT_PUBLIC_API_BASE_URL=<base-url-of-deployed/local-api>

  # Manage Testnets
  NEXT_PUBLIC_TESTNETS_ENABLED=true # if true westend will be enabled

  # Network Endpoints
  NEXT_PUBLIC_POLKADOT="wss://polkadot.api.onfinality.io/public-ws"
  NEXT_PUBLIC_KUSAMA="wss://kusama-rpc.polkadot.io"
  NEXT_PUBLIC_WESTEND="wss://westend-rpc.polkadot.io"

  # Collection Addresses
  NEXT_PUBLIC_POLKADOT_MULTISIG_COLLECTION_ADDRESS=<polkadot-collection-address>
  NEXT_PUBLIC_KUSAMA_MULTISIG_COLLECTION_ADDRESS=<kusama-collection-address>
  NEXT_PUBLIC_WESTEND_MULTISIG_COLLECTION_ADDRESS=<westend-collection-address>

  #Commission ratio
  NEXT_PUBLIC_YIELDSCAN_COMMISSION_RATIO=<decimal-number-greater-than-equal-to-zero>
  ```

  Note: Checkout backend [crawler](https://github.com/yieldscan/yieldscan-backend-crawler) and [api](https://github.com/yieldscan/yieldscan-backend-api).

  Useful resources:

  - [Amplitude](https://amplitude.com/)
  - [Metomic](https://metomic.io/)
  - [Sentry](https://sentry.io/)

- Run the development server:

  ```bash
  yarn dev
  ```

  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

  You can start editing any page by modifying `pages/<page>.js`. The page auto-updates as you edit the file.

- Creating a new user flow?
  - Create a new page in `pages/<page>.js`
  - Create a layout if needed in `components/common/layouts` else use `components/common/layouts/base.js`
  - Create the page's root component in `components/<page>/index.js`

### Git commit

Run `yarn git:commit` for commiting your code and follow the process

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Docker

You can run a docker container via -

```
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=<base-url-of-deployed/local-api> -t yieldscan-frontend
```

after running you can access the UI via http://localhost:3000

## Tests:

You can run tests via -

```
yarn test
```

## Gratitude <a name = "gratitude"></a>

![](https://github.com/buidl-labs/polkadot-chains-indexer/blob/master/.github/web3%20foundation_grants_badge_black.png)
