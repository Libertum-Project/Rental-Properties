# Rental Properties Smart Contracts

This repository contains 3 contracts for launching property collections.

- [**PropertyFactoryAndBank**](contracts/PropertyFactoryAndBank.sol)
- [**CapitalRepaymentProperty**](contracts/CapitalRepaymentProperty.sol)
- [**PassiveIncomeProperty**](contracts/PassiveIncomeProperty.sol)

## Dev Setup

Run `npm install` to install all the necessary dependencies.

Run `npx hardhat test` to run the test suite for all the contracts.

The contracts can be deployed using the [`deploy.js`](scripts/deploy.js) script as follows,

```
npx hardhat run scripts/deploy.js
```

but this deploys an ephemeral version of the contracts that cannot be interacted with. For development, consider first using

```
npx hardhat node
```

to spin up a Hardhat local network. Then use

```
npx hardhat run scripts/deploy.js --network localhost
```

in order to deploy the contracts onto our local blockchain.
