# YieldScan

Maximizing staking yield on substrate based networks(supported networks: Kusama and Polkadot). Currently, the app can be used on https://yieldscan.app .

## Table of contents

- [Currently supported networks](#supported_networks)
- [Description](#description)
- [Development](#development)
  - [Contribution Guide](#contribution-guide)
  - [Codebase Overview](#codebase-overview)
  - [Pre-requisites](#pre-requisites)
  - [Development guide](#development-guide)
- [Gratitude](#gratitude)

## Currently supported networks

- [Kusama Network](https://kusama.network/)
- [Polkadot Network](https://polkadot.network/)

## Description

[YieldScan](https://yieldscan.app) is a portfolio management platform for NPoS (nominated proof-of-stake) networks like Kusama and Polkadot. We aim to simplify portfolio management to make yield optimization easier and more accessible, for technical and non-technical users alike.

This project is funded and supported by the [Web3 Foundation](https://web3.foundation/) - under [Wave 6](https://github.com/w3f/General-Grants-Program/blob/master/grants/accepted_grant_applications.md#wave-6).

## Development

We are always working on improving our codebase, and welcome any suggestions or contributions.

### Contribution Guide

1. Create an issue for the improvement.

2. Fork the repo and make changes. Make sure to checkout from develop branch before starting.

3. Make a PR to `develop` branch.

### Codebase Overview

Important packages:

- [components/overview](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview): User profile dashboard. This displays staked amount, nominated validators and estimated APY, it also handles bond-extra, rebond and withdraw operations for the nominator/user:

  - [InvestMoreModal](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview/InvestMoreModal.js): Handles the bond extra operation.
  - [WithdrawModal](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview/WithdrawModal.js): Handles the chill and unbonding operations.
  - [RedeemUnbonded](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview/RedeemUnbonded.js): Handles the withdraw unbonded operation.
  - [ReBondModal](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview/ReBondModal.js): Handles the rebonding the unbonding amount operations.

- [components/reward-calculator](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/reward-calculator): Provides user with the auto-generated validator sets of low, medium and high risks depending on the calculated estimated staking returns and risk-scores.

- [components/staking](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/staking): This module handles different staking flows for different cases:

  - [StakeToEarn](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/staking/StakeToEarn.js): Distinct stash controller.
  - [Confirmation](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/staking/Confirmation.js): Same stash controller.
  - [SecureStakeToEarn](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/staking/SecureStakeToEarn.js): For onboarding new users to the best practices in the ecosystem.

- [components/staking/stepperSignerPopover](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/staking/stepperSignerPopover): For handling signing multiple transactions one by one.

- [components/validators](https://github.com/yieldscan/yieldscan-frontend/tree/master/components/overview): This is for DYOR users for selecting the validators for staking based on different validator stats.

### Pre-requisites

- [yieldscan-crawler](https://github.com/yieldscan/yieldscan-backend-crawler)
- [yieldscan-api](https://github.com/yieldscan/yieldscan-backend-api)

### Development guide

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
  NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api"
  # or NEXT_PUBLIC_API_BASE_URL="<base-url-of-deployed/local-api>/api"

  # Manage Testnets, if true westend will be enabled
  NEXT_PUBLIC_TESTNETS_ENABLED=true

  # Network Endpoints
  NEXT_PUBLIC_POLKADOT="wss://polkadot.api.onfinality.io/public-ws"
  NEXT_PUBLIC_KUSAMA="wss://kusama-rpc.polkadot.io"
  NEXT_PUBLIC_WESTEND="wss://westend-rpc.polkadot.io"
  ```

  Note: Checkout backend [crawler](https://github.com/yieldscan/yieldscan-backend-crawler) and [api](https://github.com/yieldscan/yieldscan-backend-api).

  Useful resources:

  - [Fathom](https://usefathom.com/)
  - [Metomic](https://metomic.io/)
  - [Sentry](https://sentry.io/)

- Run the development server:

  Note: Make sure [api](https://github.com/yieldscan/yieldscan-backend-api) and [crawler](https://github.com/yieldscan/yieldscan-backend-crawler) services are up and running

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

## Tests

You can run tests via -

```
yarn test
```

## Gratitude

![](https://github.com/buidl-labs/polkadot-chains-indexer/blob/master/.github/web3%20foundation_grants_badge_black.png)
