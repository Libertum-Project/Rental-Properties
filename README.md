# Rental-Properties

This repo is a collaborative effort by Envwise &amp; Libertum, featuring a smart contract factory for ERC1159 token rentals and a monthly profit distribution bank contract, allowing users to launch "properties" and allowing investors to claim profits.

# REACT LAYOUT

## 1. CREATE PROPERTIES - for Libertum&Envwise

### Contract: Bank

```
function createNewPropertyLoan(
    string memory _name, //PROPIEDAD DEILLERMO
    string memory _symbol, //
    uint256 _totalSupply, //
    uint256 _initialPricePerPiece, //
    uint256 _valueBackup, //
    uint256 _duration, //
    uint256 _totalRate, //%
    address _receiver) //
    {}
```

## 2. BUY PROPERTIES - for users

### Contract: BANK

```
    function buyPiece(uint256 _pieces) public {}
```

## 3. CLAIM REWARDS - for users

### Contract: BANK

```
function claimReturns(address _collection) external {}
```

## 4. LISTAR PROPIEDADES - for users

### Contract: BANK

**_1. se llama el contrato BANK para sacar las addresses del array_**

```
function registeredPropertyAddresses(
    uint256 _id) external returns(address) {}
```

[0x1,0x2,0x3,0x4,0x5]

### Contract: PROPERTYLOAN

**_2. teniendo esa address de cada "propiedad" puedes sacar las caracteristicas de cada una_**
-Mostrar las diferentes propiedades en venta que se pueden encontrar en:

```
    0x1.totalSupply() // retorna el numero de piezas que se hicieron para esta propiedad
    0x1.initialPricePerPiece() //retorna el precio de cada pieza
    uint256 s_valueBackup; //max value that can be sold (backup by envwise/libertum)
    uint256 s_duration; //duration of the loan in months(will be paid monthly)
    uint256 s_totalRate; //percentage returns offered by this property per month
    address s_receiver; //address that will receive the funds (it can be either Envwise, Libertum or the property owner)

    uint256 s_piecesSold; //to track the # of pieces that has been sold
    uint256 s_totalAmountBorrowed; //track how much was borrowed and reduce this every month
```
