// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PassiveIncomeProperty is ERC721, Ownable {
    uint256 public currentToken;
    uint256 public immutable totalSupply;
    uint256 public immutable pricePerToken;
    uint256 public immutable collateralizedValue;
    uint256 public immutable interestRate;

    IERC20 public paymentToken;

    // Tracks the state of the property (determines if claims are allowed)
    bool public isActive;
    uint256 public startTime;
    uint256 public unpaidAmount;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupply,
        uint256 _pricePerToken,
        uint256 _collateralizedValue,
        uint256 _interestRate,
        address paymentTokenAddress
    ) ERC721(name, symbol) {
        totalSupply = _totalSupply;
        pricePerToken = _pricePerToken;
        collateralizedValue = _collateralizedValue;
        interestRate = _interestRate;
        paymentToken = IERC20(paymentTokenAddress);
        unpaidAmount = _collateralizedValue;
    }

    function mint(uint256 quantity) external {
        // Check that current token is less than total supply and the correct USD amount
        // has been transferred by the user, we are checking outside of the minting loop
        // as a fail-fast mechanism.
        require(
            currentToken < totalSupply,
            "PassiveIncomeProperty: tokens sold out"
        );
        require(
            // NOTE: 10**6 is the number of decimals for USDT (and most other stablecoins)
            paymentToken.transferFrom(
                msg.sender,
                address(this),
                pricePerToken * quantity * 10 ** 6
            ),
            "PassiveIncomeProperty: purchase failed"
        );

        // Mint the correct quantity of tokens to the user and increment token counter
        for (uint256 i = 0; i < quantity; i++) {
            require(
                currentToken < totalSupply,
                "PassiveIncomeProperty: tokens sold out"
            );
            _safeMint(msg.sender, currentToken);
            currentToken++;
        }
    }

    function withdraw() external onlyOwner {
        // Allow the owner (factory) to withdraw all funds from the contract
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "PassiveIncomeProperty: no funds to withdraw");
        paymentToken.transfer(owner(), balance);
    }

    function setActive() external onlyOwner {
        // Allow the owner (factory) to activate claims
        require(!isActive, "PassiveIncomeProperty: already active");
        isActive = true;
        startTime = block.timestamp;
    }

    function setInactive() external onlyOwner {
        // Allow the owner (factory) to deactivate claims
        require(isActive, "PassiveIncomeProperty: already inactive");
        isActive = false;
    }
}
