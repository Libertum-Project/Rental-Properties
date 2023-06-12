// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./PropertyLoan.sol"; //*TO EDIT* we can change this later for an interface IProperty
import "./PropertyPassiveIncome.sol"; //*TO EDIT* we can change this later for an interface IProperty
import "./FactoryProperty.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Bank is AccessControl {
    // Edit this address when deploying on other networks with a different USDT address
    address private constant USDT_ADDRESS = 0x55d398326f99059fF775485246999027B3197955; // USDT(BSC)
    IERC20 constant USDT = IERC20(USDT_ADDRESS);

    // Mapping of all the properties and an iterable array for finding all the properties
    mapping(address => PropertyWithLoan) private s_properties;
    address[] private s_propertyAddresses;

    struct PropertyWithLoan {
        string name;
        uint256 installmentPerPiece;
        bool isActive;
        mapping(address => uint256) timeUserHasClaimed;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createNewPropertyLoan(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _initialPricePerPiece,
        uint256 _valueBackup,
        uint256 _duration,
        uint256 _totalRate,
        address _receiver
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Create new property (ERC20)
        PropertyLoan property = new PropertyLoan(
            _name,
            _symbol,
            _totalSupply,
            _initialPricePerPiece,
            _valueBackup,
            _duration,
            _totalRate,
            _receiver,
            address(this) 
        );

        // Calculate the monthly installment per piece
        uint256 totalAmount = _valueBackup + _valueBackup * _totalRate / 100;
        uint256 monthlyInstallments = totalAmount / _duration / _totalSupply;

        // Register the property's properties
        s_properties[address(property)].name = _name;
        s_properties[address(property)].installmentPerPiece = monthlyInstallments;
        s_properties[address(property)].isActive = true;
        s_propertyAddresses.push(address(property));
    }

    /**
     * @dev This function will be called ONLY by the collections created by the factory contract
     * and it will register them in the bank after they have been sold out.
     */
    function registerProperty() external { 
        //lets follow the example with the comments
        address ADDRESS_OF_THE_COLLECTION = 0x55d398326f99059fF775485246999027B3197955;
        PropertyLoan _property = PropertyLoan(msg.sender);
        uint256 _durationInMonths = _property.durationInMonths(); //5 months
        uint256 _totalPiecesSold = _property.totalPiecesSold(); //100
        uint256 _totalRate = _property.totalRate(); //10
        uint256 _amountBorrowed = USDT.balanceOf(address(_property)); //10.000usdt
        uint256 _totalAmountToPay = _amountBorrowed +((_amountBorrowed * _totalRate)/100); //10.000usdt + (10.000*10/100) = 11.000usdt
        uint256 _monthlyInstallmentsInTotal = _totalAmountToPay / _durationInMonths; //11.000usdt / 5 months = 2.200usdt
        uint256 _monthlyInstallmentsPerPiece = _monthlyInstallmentsInTotal / _totalPiecesSold; //2.200 / 100 = 22usdt (each user can claim 22usdt per NFT)
        string memory _name = _property.name();
        _createAndRegisterNewProperty(_name, _monthlyInstallmentsPerPiece,ADDRESS_OF_THE_COLLECTION);
    }

    function _createAndRegisterNewProperty(string memory _name, uint256 _monthlyInstallmentsPerPiece, address _collectionAddress) internal{
        PropertyWithLoan storage property = s_properties[_collectionAddress];
        property.name = _name;
        property.installmentPerPiece = _monthlyInstallmentsPerPiece;
        property.isActive = true;
    }

    function claimReturns(address _collection) external {
        require(s_properties[_collection].isActive, "Property payouts are not active");

        address _user = msg.sender;
        uint256 _installment = s_properties[_collection].installmentPerPiece;
        uint256 _piecesOfUser = IERC20(_collection).balanceOf(_user);
        uint256 _amountToPayUser = _piecesOfUser * _installment;
        //TO DO - logic for the time (to claim once a month)

        require(USDT.transfer(_user, _amountToPayUser),"The bank doesn't have funds");
    }
}