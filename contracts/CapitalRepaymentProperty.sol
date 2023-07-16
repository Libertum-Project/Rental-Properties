// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CapitalRepaymentProperty is ERC721 {
    uint256 totalSupply;
    uint256 initialPrice;
    uint256 collateralizedValue;
    uint256 durationInMonths;
    uint256 interestRate;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupply,
        uint256 _initialPrice,
        uint256 _collateralizedValue,
        uint256 _durationInMonths,
        uint256 _interestRate
    ) ERC721(name, symbol) {
        totalSupply = _totalSupply;
        initialPrice = _initialPrice;
        collateralizedValue = _collateralizedValue;
        durationInMonths = _durationInMonths;
        interestRate = _interestRate;
    }
}
