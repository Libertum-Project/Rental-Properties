# Rental-Properties

This repo is a collaborative effort by Envwise &amp; Libertum, featuring a smart contract factory for ERC1159 token rentals and a monthly profit distribution bank contract, allowing users to launch "properties" and allowing investors to claim profits.

# REACT LAYOUT

## CREATE PROPERTIES - for Libertum&Envwise

### Contract: Bank

```
function createNewPropertyLoan(
    string memory _name,
    string memory _symbol,
    uint256 _totalSupply,
    uint256 _initialPricePerPiece,
    uint256 _valueBackup,
    uint256 _duration,
    uint256 _totalRate,
    address _receiver) {}
```

## CLAIM REWARDS - for users

### Contract: BANK

```
function claimReturns(address _collection) external {}
```

## BUY PROPERTIES - for users

### Contract: PropertyLoan

-Mostrar las diferentes propiedades en venta que se pueden encontrar en:

```
function registeredPropertyAddresses(
    uint256 _id) external returns(address) {}
```

este te retornara el address de las propiedades que han sido registradas en el BANK contract
luego teniendo esta address, puedes ir a ver cada una de sus caracteristicas

```
_name,
_symbol,
_totalSupply,
_initialPricePerPiece,
_valueBackup,
_duration,
_totalRate,
_receiver,
```
