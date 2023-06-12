// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./PropertyLoan.sol";
import "./PropertyPassiveIncome.sol";
import "./Bank.sol";

contract FactoryProperty is AccessControl {
    //~~~~ IMMUTABLE VARIABLES ~~~~
    Bank private immutable s_bank; //bank will be deployed from this contract to keep it connected as a deployer.

    //~~~~ STATE VARIABLES ~~~~
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE"); //can create new properties
    mapping(address => bool) private s_collectionsCreated; //collections created by this factory contract

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        s_bank = new Bank();
    }

    function addCreator(address _address) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CREATOR_ROLE, _address);
    }

    //~~~~ EXTERNAL FUNCTIONS(2) ~~~~
    function createNewPropertyLoan(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _initialPricePerPiece,
        uint256 _valueBackup,
        uint256 _duration,
        uint256 _totalRate,
        address _receiver
    ) external onlyRole(CREATOR_ROLE) {
        _registerCollection(
            address(
                _createPropertyLoan(
                    _name,
                    _symbol,
                    _totalSupply,
                    _initialPricePerPiece,
                    _valueBackup,
                    _duration,
                    _totalRate,
                    _receiver
                )
            )
        );
    }

    function createNewPropertyLoan() external onlyRole(CREATOR_ROLE) {
        //TO DO
        _registerCollection(address(_createPropertyPassiveIncome()));
    }

    //~~~~ INTERNAL FUNCTIONS(3) ~~~~
    function _createPropertyLoan(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _initialPricePerPiece,
        uint256 _valueBackup,
        uint256 _duration,
        uint256 _totalRate,
        address _receiver
    ) internal returns (address) {
        //creation of new erc1155(property)
        PropertyLoan _newProperty = new PropertyLoan(
            _name,
            _symbol,
            _totalSupply,
            _initialPricePerPiece,
            _valueBackup,
            _duration,
            _totalRate,
            _receiver,
            bankAddress()
        );
        return address(_newProperty);
    }

    function _createPropertyPassiveIncome() internal returns (address) {
        //TO DO
        PropertyPassiveIncome _newProperty = new PropertyPassiveIncome();
    }

    function _registerCollection(address _collection) internal {
        s_collectionsCreated[_collection] = true;
    }

    //~~~~ VIEW FUNCTIONS(2) ~~~~
    function bankAddress() public view returns (address) {
        return address(s_bank);
    }

    function collectionCreated(address _collection) public view returns (bool) {
        return s_collectionsCreated[_collection];
    }
}
