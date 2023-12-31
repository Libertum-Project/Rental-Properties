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

## Deploying to Testnet

To deploy a version of this contract to Polygon Mumbai, first create a file named `.env` in the root folder. This will store all the keys required for deployment. It should look like this (with the details filled in):

```json
POLYGONSCAN_API_KEY = "Create API Key on PolygonScan"
ALCHEMY_API_KEY = "Create API Key on Alchemy"
PRIVATE_KEY = "Private key for deploying EOA"
```

To deploy the contracts, run:

```sh
npx hardhat run scripts/deploy.js --network mumbai
```

After deployment, verify contracts using:

```sh
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

If there are any issues with verification, run this command:

```sh
npx hardhat clean
```

## PropertyFactoryAndBank

_onlyOwner_ denotes that the function can only be called by the deployer of the contract.

### Creating New Properties

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

### Setting Properties as Active/Inactive

Setting a property as active sets the `startTime` variable for the property, which allows users to claim their monthly payouts after 30 days have elapsed (and every subsequent 30 days after that, until expiration or closure).

3. **setActiveCapitalRepayment** (_onlyOwner_) - this function sets the capital repayment property at the given address to active, thereby allowing claims to begin. It accepts one argument:

   - _address_ `propertyAddress` - the address of the capital repayment property to activate

4. **setInactiveCapitalRepayment** (_onlyOwner_) - this function sets the capital repayment property at the given address to inactive, thereby pausing all claims against the property. It accepts one argument:

   - _address_ `propertyAddress` - the address of the capital repayment property to deactivate

5. **setActivePassiveIncome** (_onlyOwner_) - this function sets the passive income property at the given address to active, thereby allowing claims to begin. It accepts one argument:

   - _address_ `propertyAddress` - the address of the passive income property to activate

6. **setInactivePassiveIncome** (_onlyOwner_) - this function sets the passive income property at the given address to inactive, thereby pausing all claims against the property. It accepts one argument:

   - _address_ `propertyAddress` - the address of the passive income property to deactivate

### User Claims

These functions can be called by a user (aided by the frontend) to claim their monthly returns on a property they own. The smart contract checks that:

- The user owns all the properties in the property array
- The user has not claimed in the last 30 days
- The property is active
- The smart contract has sufficient funds in the denominated currency to process payment

7. **claimCapitalRepayment** - this function allows the user to claim their monthly payment from a capital repayment property, and accepts the following arguments:

   - _address_ `propertyAddress` - the address of the capital repayment property the user fractionally owns
   - _uint256[]_ `tokenIds` - an array of tokenIds owned by the user

8. **claimPassiveIncome** - this function allows the user to claim their monthly payment from a passive income property, and accepts the following arguments:

   - _address_ `propertyAddress` - the address of the passive income property the user fractionally owns
   - _uint256[]_ `tokenIds` - an array of tokenIds owned by the user

### Getter Functions

9. **numCapitalRepaymentProperties** - this _view_ function returns the length of the `capitalRepaymentProperties` array which allows us to use the getter contained within that contract to iterate through the property array.

10. **numPassiveIncomeProperties** - this _view_ function returns the length of the `passiveIncomeProperties` array which allows us to use the getter contained within that contract to iterate through the property array.

### Admin Withdrawals

Funds held on specific property contracts (via sale of NFTs) can be withdrawn using this function into a specified address.

11. **withdrawFromCapitalRepaymentProperty** - this function transfers all funds held by the capital repayment property contract (of the designated `paymentTokenAddress`) into a specified wallet, it accepts two arguments:

    - _address_ `from` - the address of the capital repayment property contract
    - _address_ `to` - the specified destination of the funds held by the contract

12. **withdrawFromPassiveIncomeProperty** - this function transfers all funds held by the passive income property contract (of the designated `paymentTokenAddress`) into a specified wallet, it accepts two arguments:

    - _address_ `from` - the address of the passive income property contract
    - _address_ `to` - the specified destination of the funds held by the contract

## CapitalRepaymentProperty

### External Contract Functions

This contract contains functions used by the bank contract:

1. `withdraw(address to)`
2. `setActive()`
3. `setInactive()`
4. `setLastClaimed(uint256 tokenId, uint256 timestamp)`
5. `setNumberOfClaims(uint256 tokenId, uint256 _numberOfClaims)`

These cannot be called by anybody else except the bank contract, which owns the contract it created.f

### User Minting

The user is able to mint NFTs belonging to the collection provided that:

- The tokens are not sold out
- They have approved the contract for the requisite amount of USDT/USDC needed to purchase NFT(s)

6. **mint** - prior to calling this function on the frontend, be sure to request approval from the user for the contract to spend _x_ stablecoin as defined by the contract, or the transaction will fail because of insufficient allowance. The number _x_ can be computed by `quantity * pricePerToken * 10**6` (note that all stablecoins have 6 decimal places). This function accepts one argument:

   - _uint256_ `quantity` - the number of NFTs the user wishes to purchase

### Getter Functions

The properties of this contract can be accessed using the getter functions provided by Solidity for most variables.

7. **name()** - returns the name of this property collection
8. **symbol()** - returns the symbol of this property collection
9. **currentToken()** - returns the next token id that will be minted
10. **totalSupply()** - returns the total of tokens in this collection
11. **pricePerToken()** - returns the price per token
12. **collateralizedValue()** - returns the total collateralized value of the property
13. **durationInMonths()** - returns the total duration of the loan, in months
14. **interestRate()** - returns the monthly interest rate multiplied by 100
15. **paymentToken()** - returns the address of the payment token accepted by the contract
16. **isActive()** - returns a boolean representing whether payouts are active
17. **startTime()** - returns a uint256 timestamp denoting when payouts started

## PassiveIncomeProperty

### External Contract Functions

This contract contains functions used by the bank contract:

1. `withdraw(address to)`
2. `setActive()`
3. `setInactive()`
4. `setLastClaimed(uint256 tokenId, uint256 timestamp)`

These cannot be called by anybody else except the bank contract, which owns the contract it created.f

### User Minting

The user is able to mint NFTs belonging to the collection provided that:

- The tokens are not sold out
- They have approved the contract for the requisite amount of USDT/USDC needed to purchase NFT(s)

5. **mint** - prior to calling this function on the frontend, be sure to request approval from the user for the contract to spend _x_ stablecoin as defined by the contract, or the transaction will fail because of insufficient allowance. The number _x_ can be computed by `quantity * pricePerToken * 10**6` (note that all stablecoins have 6 decimal places). This function accepts one argument:

   - _uint256_ `quantity` - the number of NFTs the user wishes to purchase

### Getter Functions

The properties of this contract can be accessed using the getter functions provided by Solidity for most variables.

6. **name()** - returns the name of this property collection
7. **symbol()** - returns the symbol of this property collection
8. **currentToken()** - returns the next token id that will be minted
9. **totalSupply()** - returns the total of tokens in this collection
10. **pricePerToken()** - returns the price per token
11. **collateralizedValue()** - returns the total collateralized value of the property
12. **interestRate()** - returns the monthly interest rate multiplied by 100
13. **paymentToken()** - returns the address of the payment token accepted by the contract
14. **isActive()** - returns a boolean representing whether payouts are active
15. **startTime()** - returns a uint256 timestamp denoting when payouts started
16. **unpaidAmount()** - returns a uint256 value of the outstanding amount owed by the property owner

### Loan Repayment

The property owner is able to terminate the passive income faucet at any time by paying back the entire collateralized value in full (monthly passive income that has been collected by fractionalized owners of the collection not included). When `unpaidAmount` reaches 0, `isActive` is set to `false`, denoting the end of the passive income faucet.

17. **repayLoan** - attempts to transfer the specified quantity of the denoted currency to the contract and updates the outstanding amount accordingly, accepts one argument:

    - _uint256_ `amount` - the amount of USDT/USDC that the owner wishes to repay
