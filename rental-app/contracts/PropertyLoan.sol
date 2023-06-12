// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FactoryProperty.sol";
import "./Bank.sol";

contract PropertyLoan is ERC20 {
    /*
    SUMMARY OF THIS CONTRACT:
        -factoryContract is the one that deploys this(Property) contract
        -constructor create the collection and set the bank & factory contract
        -all the purchases will be done in usdt for practical purposes
        -buyPiece is the only function that the users can call 
        -transfer will be DISABLED when the investmentType is a LOAN
        -when all the NFTs(pieces) are sold out, this contract will register itself in the bank
        -only when the collection is sold out, the s_receiver will get all the funds from this contract
    
    TO DO(for now): 
        1. change all state variables to private and create external functions to view them
        2. implement buyPiece function
        3. transfer funds once collection is sold out
        4. create a function for the users to get their funds back if the collection wasn't sold out in 1 month
        5. disable transfers for this collection
        6. at the end, try to optimize some lines of code.
    */

    //~~~ CONSTANT VARIABLES ~~~
    IERC20 constant USDT = IERC20(0x55d398326f99059fF775485246999027B3197955); //*TO EDIT* USDT in BSC network

    //~~~ STATE VARIABLES ~~~
    FactoryProperty private s_factoryContract; //factoryProperty contract
    Bank private s_bank; //Bank contract

    //~~~ Characteristics of a "Property" that need to be defined during creation of the property
    uint256 s_totalSupply; //max quantity of pieces to be sold
    uint256 s_initialPricePerPiece; //price per piece in USDT
    uint256 s_valueBackup; //max value that can be sold (backup by envwise/libertum)
    uint256 s_duration; //duration of the loan in months(will be paid monthly)
    uint256 s_totalRate; //percentage returns offered by this property per month
    address s_receiver; //address that will receive the funds (it can be either Envwise, Libertum or the property owner)

    uint256 s_piecesSold; //to track the # of pieces that has been sold
    uint256 s_totalAmountBorrowed; //track how much was borrowed and reduce this every month

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _initialPricePerPiece,
        uint256 _valueBackup,
        uint256 _duration,
        uint256 _totalRate,
        address _receiver,
        address _bankAddress
    ) ERC20(_name, _symbol) {
        require(
            (_totalSupply * _initialPricePerPiece) < _valueBackup,
            "Property: Exceeds value that is backed up"
        );
        //set factory & bank addresses
        s_factoryContract = FactoryProperty(msg.sender);
        s_bank = Bank(_bankAddress);

        //set characteristics of property
        s_totalSupply = _totalSupply;
        s_initialPricePerPiece = _initialPricePerPiece;
        s_totalRate = _totalRate;
        s_valueBackup = _valueBackup;
        s_receiver = _receiver;
    }

    function buyPiece(uint256 _pieces) public {
        require(_pieces > 0 && _pieces < piecesAvailable());
        //transfer the token to the user and disable the transfer function
        //transfer usdt from user to this contract, ONLY after all pcs are sold, transfer funds to s_receiver
        //s_piecesSold ++;
        _soldOut();
    }

    function _soldOut() internal {
        //only when all pieces has been sold this function will be trigger
        //and it'll register this property in the bank
        if (piecesAvailable() == 0) {
            s_bank.registerProperty();
            uint256 balanceUSDT = USDT.balanceOf(address(this));
            USDT.transfer(receiverOfTheFunds(), balanceUSDT);
        }
    }

    //~~~~ VIEW FUNCTIONS ~~~~
    function piecesAvailable() public view returns (uint256) {
        return s_totalSupply - s_piecesSold;
    }

    function totalPieces() public view returns (uint256) {
        return s_totalSupply;
    }

    function totalPiecesSold() public view returns (uint256) {
        return s_piecesSold;
    }

    function bankContract() external view returns (Bank) {
        return s_bank;
    }

    function factoryContract() external view returns (FactoryProperty) {
        return s_factoryContract;
    }

    function receiverOfTheFunds() public view returns (address) {
        return s_receiver;
    }

    function durationInMonths() public view returns (uint256) {
        return s_duration;
    }

    function totalRate() public view returns (uint256) {
        return s_totalRate;
    }
}
