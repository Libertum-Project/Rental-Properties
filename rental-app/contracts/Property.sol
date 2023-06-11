// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Property is ERC1155 {

    IERC20 constant USDT = IERC20(0x55d398326f99059fF775485246999027B3197955); //USDT in BCS network
     
    enum Option {LOAN, PASSIVE_INCOME}

    //Characteristics of a "Property" that need to be defined during creation of the property
    Option s_investmentType; //type of investment (loan or passive income)
    uint256 s_totalSupply; //max quantity of pieces to be sold
    uint256 s_initialPricePerPiece; //price per piece in USDT
    uint256 s_ratePerMonth; //percentage returns offered by this property per month 
    uint256 s_valueBackup; //max value that can be sold (backup by envwise/libertum)
    address s_receiver; //address that will receive the funds (it can be either Envwise, Libertum or the property owner)

    uint256 s_piecesSold; //to track the # of pieces that has been sold
   
    constructor(Option _option, uint256 _totalSupply, uint256 _initialPricePerPiece, uint256 _rate, uint256 _valueBackup, address _receiver ) ERC1155("uri_here"){
        require((_totalSupply * _initialPricePerPiece) < _valueBackup, "Property: Exceeds value that is backed up");
        s_investmentType = _option;
        s_totalSupply = _totalSupply;
        s_initialPricePerPiece = _initialPricePerPiece;
        s_ratePerMonth = _rate;
        s_valueBackup = _valueBackup;
        s_receiver = _receiver;


    
    }

    /** TO DO
     * 
     * @param _pieces number of pieces to buy
     */
    function buyPiece(uint256 _pieces) public {
        require(_pieces> 0 && _pieces < piecesAvailable());

        //transfer usdt from user to the s_receiver(state variable)
        //s_piecesSold ++;

    }


    //~~~~ VIEW FUNCTIONS ~~~~
    function piecesAvailable() public view returns(uint256){
        return s_totalSupply - s_piecesSold;
    }

    function totalSupply() public view returns(uint256){
        return s_totalSupply;
    }

    function totalPiecesSold() public view returns(uint256){
        return s_piecesSold;
    }

}