// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./CapitalRepaymentProperty.sol";
import "./PassiveIncomeProperty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyFactoryAndBank is Ownable {
    address[] public capitalRepaymentProperties;

    constructor() {}

    function newCapitalRepaymentProperty(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 pricePerToken,
        uint256 collateralizedValue,
        uint256 durationInMonths,
        uint256 interestRate,
        address paymentTokenAddress
    ) external onlyOwner returns (address) {
        CapitalRepaymentProperty property = new CapitalRepaymentProperty(
            name,
            symbol,
            totalSupply,
            pricePerToken,
            collateralizedValue,
            durationInMonths,
            interestRate,
            paymentTokenAddress
        );

        capitalRepaymentProperties.push(address(property));

        return address(property);
    }
}
