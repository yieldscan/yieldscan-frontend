# YieldScan

Maximizing yield on staking. Starting with Kusama.

## Table of contents

- [Currently supported networks](#supported_networks)
- [Description](#description)
- [Development](#development)
  - [Pre-requisites](#development-pre-requisites)
  - [Installation Instructions](#installation)
  - [Dependencies](#dependencies)
- [Gratitude](#gratitude)

## Currently supported networks <a name = "supported_networks"></a>

- [Kusama Network](https://kusama.network/)
- [Polkadot Network](https://polkadot.network/)

## Description <a name = "description"></a>

We aim to solve the problems of information asymmetry in identifying and optimizing returns on staking, reducing time and capital costs for stakers to make staking decisions.

This project is funded and supported by the [Web3 Foundation](https://web3.foundation/) - under [Wave 6](https://github.com/w3f/General-Grants-Program/blob/master/grants/accepted_grant_applications.md#wave-6).

## Usage <a name = "usage"></a>

### Pre-requisites <a name = "usage-pre-requisites"></a>

- PolkadotJS browser extension
- At least one account on Kusama or Polkadot with enough balance to pay for transaction fees and bond funds.

Currently, the app can be used on https://yieldscan.app .

## Development <a name = "development"></a>

### Getting Started

- Clone the repository:
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
