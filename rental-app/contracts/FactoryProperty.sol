// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Property.sol";
import "./Bank.sol";


contract FactoryProperty is AccessControl {

    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE"); //can mint new properties
    
    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
    }

    /**
     * 
     * @param _address address of the user that will be a creator.
     * 
     * NOTE: Only creators can create new properties.
     */
    function addCreator(address  _address) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CREATOR_ROLE, _address);
    }

    function createNewProperty(Property.Option _option, uint256 _totalSupply, uint256 _initialPrice, uint256 _rate, uint256 _valueBackup, address _receiver) public onlyRole(CREATOR_ROLE) {
        //creation of new erc1155(property)
        Property _newProperty = new Property(_option, _totalSupply, _initialPrice, _rate, _valueBackup, _receiver);

        //communicate with the bank to register this new property

    }


}