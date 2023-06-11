// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./PropertyLoan.sol"; //*TO EDIT* we can change this later for an interface IProperty
import "./PropertyPassiveIncome.sol"; //*TO EDIT* we can change this later for an interface IProperty
import "./FactoryProperty.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bank {

    IERC20 constant USDT = IERC20(0x55d398326f99059fF775485246999027B3197955); //*TO EDIT* USDT in BCS network
    FactoryProperty private s_factoryContract; //only this contract will be able to register properties
    mapping (address => PropertyWithLoan) private s_properties;

    struct PropertyWithLoan {
        string name;
        uint256 installmentPerPiece;
        uint256 startingTime;
        mapping(address => uint256) timeUserHasClaimed;
    }


    constructor(){
        s_factoryContract = FactoryProperty(msg.sender);
    }

    modifier onlyWallets(){
        require(msg.sender == tx.origin, "Only EOAs allowed"); //avoid to be called by smart contracts
        _;
    }

    /**
     * Only collections created by the factory contract
     */
    modifier onlyTrustedCollections(){
        require(s_factoryContract.collectionCreated(msg.sender), "Property was not created by factory");
        _;
    }

    /**
     * @dev This function will be called ONLY by the collections created by the factory contract
     * and it will register them in the bank after they have been sold out.
     */
    function registerProperty() external onlyTrustedCollections() { 
        //lets follow the example with the comments
        PropertyLoan _property = PropertyLoan(msg.sender);
        uint256 _durationInMonths = _property.durationInMonths(); //5 months
        uint256 _totalPiecesSold = _property.totalPiecesSold(); //100
        uint256 _totalRate = _property.totalRate(); //10
        uint256 _amountBorrowed = USDT.balanceOf(address(_property)); //10.000usdt
        uint256 _totalAmountToPay = _amountBorrowed +((_amountBorrowed * _totalRate)/100); //10.000usdt + (10.000*10/100) = 11.000usdt
        uint256 _monthlyInstallmentsInTotal = _totalAmountToPay / _durationInMonths; //11.000usdt / 5 months = 2.200usdt
        uint256 _monthlyInstallmentsPerPiece = _monthlyInstallmentsInTotal / _totalPiecesSold; //2.200 / 100 = 22usdt (each user can claim 22usdt per NFT)
        string memory _name = _property.nameOfTheProperty();
        _createAndRegisterNewProperty(_name, _monthlyInstallmentsPerPiece);
    }

    function _createAndRegisterNewProperty(string memory _name, uint256 _monthlyInstallmentsPerPiece) internal{
        PropertyWithLoan storage newProperty;
        newProperty.name = _name;
        newProperty.installmentPerPiece = _monthlyInstallmentsPerPiece;
        newProperty.startingTime = block.timestamp;
    }

    function claimReturns(address _collection) external onlyWallets(){
        address _user = msg.sender;
        uint256 _installment = s_properties[_collection].installmentPerPiece;
        uint256 _piecesOfUser = IERC20(_collection).balanceOf(_user);
        uint256 _amountToPayUser = _piecesOfUser * _installment;
        //TO DO - logic for the time (to claim once a month)
        require(USDT.transfer(_user, _amountToPayUser),"The bank doesn't have funds");
    }

    //~~~~ VIEW FUNCTIONS ~~~~
    function factoryContract() public view returns(FactoryProperty){
        return s_factoryContract;
    }

}