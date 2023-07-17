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

## PropertyFactoryAndBank

_onlyOwner_ denotes that the function can only be called by the deployer of the contract.

1. **newCapitalRepaymentProperty** (_onlyOwner_) - this function creates a new ERC-721 collection representing a capital repayment property, and accepts the following arguments:
  - _string_ `name` - The name of the property
  - _string_ `symbol` - The symbol of the property
  - _uint256_ `totalSupply` - The total supply of tokens in this collection
  - _uint256_ `pricePerToken` - The price per token
  - _uint256_ `collateralizedValue` - The total collateralized value of the property (should add up to `totalSupply * pricePerToken`)
  - _uint256_ `durationInMonths` - Duration of the capital repayment, in months
  - _uint256_ `interestRate` - **Monthly interest rate expressed as a multiple of 100**, e.g. 5% is expressed as 500, 0.5% is expressed as 50 (this is done for precision because Solidity does not support floats)
  - _address_ `paymentTokenAddress` - The address of the ERC-20 token used for purchasing this property and collecting payouts. We use a mock USDT token [`MockUSDT.sol`](contracts/MockUSDT.sol) in development, but this address should be changed for the address of USDT/USDC on mainnet.

Calling this function emits a `CapitalRepaymentPropertyCreated` event with an indexed `propertyAddressed`. This can be accessed and retrieved from the blockchain for accounting purposes.

2. **newPassiveIncomeProperty** (_onlyOwner_) - this function creates a new ERC-721 collection representing a passive income property, and accepts the following arguments:
  - _string_ `name` - The name of the property
  - _string_ `symbol` - The symbol of the property
  - _uint256_ `totalSupply` - The total supply of tokens in this collection
  - _uint256_ `pricePerToken` - The price per token
  - _uint256_ `collateralizedValue` - The total collateralized value of the property (should add up to `totalSupply * pricePerToken`)
  - _uint256_ `interestRate` - **Monthly interest rate expressed as a multiple of 100**, e.g. 5% is expressed as 500, 0.5% is expressed as 50 (this is done for precision because Solidity does not support floats)
  - _address_ `paymentTokenAddress` - The address of the ERC-20 token used for purchasing this property and collecting payouts. We use a mock USDT token [`MockUSDT.sol`](contracts/MockUSDT.sol) in development, but this address should be changed for the address of USDT/USDC on mainnet.

Calling this function emits a `PassiveIncomePropertyCreated` event with an indexed `propertyAddressed`. This can be accessed and retrieved from the blockchain for accounting purposes.
