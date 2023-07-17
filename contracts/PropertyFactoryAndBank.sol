// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./CapitalRepaymentProperty.sol";
import "./PassiveIncomeProperty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract PropertyFactoryAndBank is Ownable {
    address[] public capitalRepaymentProperties;
    address[] public passiveIncomeProperties;

    event CapitalRepaymentPropertyCreated(address indexed propertyAddress);
    event PassiveIncomePropertyCreated(address indexed propertyAddress);

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

        // Add the property address to the dynamic array of properties and emit event
        capitalRepaymentProperties.push(address(property));
        emit CapitalRepaymentPropertyCreated(address(property));

        return address(property);
    }

    function newPassiveIncomeProperty(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 pricePerToken,
        uint256 collateralizedValue,
        uint256 interestRate,
        address paymentTokenAddress
    ) external onlyOwner returns (address) {
        PassiveIncomeProperty property = new PassiveIncomeProperty(
            name,
            symbol,
            totalSupply,
            pricePerToken,
            collateralizedValue,
            interestRate,
            paymentTokenAddress
        );

        // Add the property address to the dynamic array of properties and emit event
        passiveIncomeProperties.push(address(property));
        emit PassiveIncomePropertyCreated(address(property));

        return address(property);
    }

    function setActiveCapitalRepayment(
        address propertyAddress
    ) external onlyOwner {
        CapitalRepaymentProperty property = CapitalRepaymentProperty(
            propertyAddress
        );

        property.setActive();
    }

    function setInactiveCapitalRepayment(
        address propertyAddress
    ) external onlyOwner {
        CapitalRepaymentProperty property = CapitalRepaymentProperty(
            propertyAddress
        );

        property.setInactive();
    }

    function claimCapitalRepayment(
        address propertyAddress,
        uint256[] memory tokenIds
    ) external {
        CapitalRepaymentProperty property = CapitalRepaymentProperty(
            propertyAddress
        );
        require(
            property.isActive(),
            "PropertyFactoryAndBank: property is not active"
        );

        // Check for ownership and claim eligibility for each tokenId in the array
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                property.ownerOf(tokenIds[i]) == msg.sender,
                "PropertyFactoryAndBank: caller is not owner of token"
            );

            uint256 lastClaimed = property.lastClaimed(tokenIds[i]);

            // NOTE: setting lastClaimed to 30 days after last claim prevents the need
            // for timely claims.
            if (lastClaimed == 0) {
                // For first claims, set lastClaimed to 30 days after start time
                require(
                    property.startTime() + 30 days >= block.timestamp,
                    "PropertyFactoryAndBank: payout not ready"
                );
                property.setLastClaimed(
                    tokenIds[i],
                    property.startTime() + 30 days
                );
            } else {
                // For future claims, set lastClaimed to 30 days after last claim
                require(
                    lastClaimed + 30 days >= block.timestamp,
                    "PropertyFactoryAndBank: payout not ready"
                );
            }
        }

        uint256 totalAmount = (property.collateralizedValue() *
            (10000 + property.interestRate())) / 10000;
        console.log(totalAmount, "totalAmount");
        uint256 monthlyPayment = totalAmount /
            property.durationInMonths() /
            property.totalSupply();
        console.log(monthlyPayment, "monthlyPayment");
        uint256 totalPayout = tokenIds.length * monthlyPayment * 10 ** 6;

        console.log("Total payout", totalPayout);

        IERC20 paymentToken = IERC20(property.paymentToken());

        require(
            paymentToken.balanceOf(address(this)) >= totalPayout,
            "PropertyFactoryAndBank: insufficient funds"
        );
        require(
            paymentToken.transfer(msg.sender, totalPayout),
            "PropertyFactoryAndBank: transfer failed"
        );
    }

    function numCapitalRepaymentProperties() external view returns (uint256) {
        return capitalRepaymentProperties.length;
    }

    function numPassiveIncomeProperties() external view returns (uint256) {
        return passiveIncomeProperties.length;
    }
}
