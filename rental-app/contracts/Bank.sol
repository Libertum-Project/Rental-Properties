// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./PropertyLoan.sol"; //*TO EDIT* we can change this later for an interface IProperty
import "./PropertyPassiveIncome.sol"; //*TO EDIT* we can change this later for an interface IProperty
import "./FactoryProperty.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Bank is AccessControl {
    // Edit this address when deploying on other networks with a different USDT address
    address private constant USDT_ADDRESS =
        0x55d398326f99059fF775485246999027B3197955; // USDT(BSC)
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
        uint256 totalAmount = _valueBackup + (_valueBackup * _totalRate) / 100;
        uint256 monthlyInstallments = totalAmount / _duration / _totalSupply;

        // Register the property's properties
        s_properties[address(property)].name = _name;
        s_properties[address(property)]
            .installmentPerPiece = monthlyInstallments;
        s_properties[address(property)].isActive = true;
        s_propertyAddresses.push(address(property));
    }

    function claimReturns(address _collection) external {
        require(
            s_properties[_collection].isActive,
            "Property payouts are not active"
        );

        address _user = msg.sender;
        uint256 _installment = s_properties[_collection].installmentPerPiece;
        uint256 _piecesOfUser = IERC20(_collection).balanceOf(_user);
        uint256 _amountToPayUser = _piecesOfUser * _installment;

        // Check that user has not claimed this month
        require(
            s_properties[_collection].timeUserHasClaimed[_user] <
                block.timestamp - 30 days,
            "User has already claimed this month"
        );

        // If user has not claimed before, update claim time to current time
        if (s_properties[_collection].timeUserHasClaimed[_user] == 0) {
            s_properties[_collection].timeUserHasClaimed[_user] = block
                .timestamp;
        } else {
            // Add 30 days from the user's last claim (so that timely claims are not required)
            s_properties[_collection].timeUserHasClaimed[_user] += 30 days;
        }

        // Transfer funds (if available) to the user
        require(
            USDT.transfer(_user, _amountToPayUser),
            "The bank doesn't have sufficient funds"
        );
    }

    function registeredPropertyAddresses(uint256 _id) external returns(address) {
        return s_propertyAddresses[_id];
    }

}
