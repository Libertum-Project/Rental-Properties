// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CapitalRepaymentProperty is ERC721, Ownable {
    uint256 public currentToken;
    uint256 public immutable totalSupply;
    uint256 public immutable pricePerToken;
    uint256 public immutable collateralizedValue;
    uint256 public immutable durationInMonths;
    uint256 public immutable interestRate;

    IERC20 public paymentToken;

    // Tracks the state of the property (determines if claims are allowed)
    bool public isActive;
    uint256 public startTime;
    mapping(uint256 => uint256) public lastClaimed;
    mapping(uint256 => uint256) public numberOfClaims;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupply,
        uint256 _pricePerToken,
        uint256 _collateralizedValue,
        uint256 _durationInMonths,
        uint256 _interestRate,
        address paymentTokenAddress
    ) ERC721(name, symbol) {
        totalSupply = _totalSupply;
        pricePerToken = _pricePerToken;
        collateralizedValue = _collateralizedValue;
        durationInMonths = _durationInMonths;
        interestRate = _interestRate;
        paymentToken = IERC20(paymentTokenAddress);
    }

    function mint(uint256 quantity) external {
        // Check that current token is less than total supply and the correct USD amount
        // has been transferred by the user, we are checking outside of the minting loop
        // as a fail-fast mechanism.
        require(
            currentToken < totalSupply,
            "CapitalRepaymentProperty: tokens sold out"
        );
        require(
            // NOTE: 10**6 is the number of decimals for USDT (and most other stablecoins)
            paymentToken.transferFrom(
                msg.sender,
                address(this),
                pricePerToken * quantity * 10 ** 6
            ),
            "CapitalRepaymentProperty: purchase failed"
        );

        // Mint the correct quantity of tokens to the user and increment token counter
        for (uint256 i = 0; i < quantity; i++) {
            require(
                currentToken < totalSupply,
                "CapitalRepaymentProperty: tokens sold out"
            );
            _safeMint(msg.sender, currentToken);
            currentToken++;
        }
    }

    function withdraw(address to) external onlyOwner {
        // Allow the owner (factory) to withdraw all funds from the contract
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "CapitalRepaymentProperty: no funds to withdraw");
        paymentToken.transfer(address(to), balance);
    }

    function setActive() external onlyOwner {
        // Allow the owner (factory) to activate claims
        require(!isActive, "CapitalRepaymentProperty: already active");
        isActive = true;
        startTime = block.timestamp;
    }

    function setInactive() external onlyOwner {
        // Allow the owner (factory) to deactivate claims
        require(isActive, "CapitalRepaymentProperty: already inactive");
        isActive = false;
    }

    function setLastClaimed(
        uint256 tokenId,
        uint256 timestamp
    ) external onlyOwner {
        // Allow the owner (factory) to set the last claimed timestamp for a token
        lastClaimed[tokenId] = timestamp;
    }

    function setNumberOfClaims(
        uint256 tokenId,
        uint256 _numberOfClaims
    ) external onlyOwner {
        // Allow the owner (factory) to set the number of claims for a token
        numberOfClaims[tokenId] = _numberOfClaims;
    }
}
