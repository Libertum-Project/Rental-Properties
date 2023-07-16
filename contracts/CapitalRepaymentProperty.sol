// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CapitalRepaymentProperty is ERC721 {
    uint256 currentToken;
    uint256 totalSupply;
    uint256 pricePerToken;
    uint256 collateralizedValue;
    uint256 durationInMonths;
    uint256 interestRate;

    IERC20 public usdtToken;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupply,
        uint256 _pricePerToken,
        uint256 _collateralizedValue,
        uint256 _durationInMonths,
        uint256 _interestRate
    ) ERC721(name, symbol) {
        totalSupply = _totalSupply;
        pricePerToken = _pricePerToken;
        collateralizedValue = _collateralizedValue;
        durationInMonths = _durationInMonths;
        interestRate = _interestRate;

        // USDT address on Polygon
        // https://polygonscan.com/token/0xc2132d05d31c914a87c6611c10748aeb04b58e8f
        usdtToken = IERC20(0xc2132D05D31c914a87C6611C10748AEb04B58e8F);
    }

    function mint() external {
        // Check that current token is less than total supply and the correct USDT amount
        // has been transferred by the user.
        require(currentToken < totalSupply, "All NFTs have been minted");
        require(
            usdtToken.transferFrom(msg.sender, address(this), pricePerToken),
            "Failed to transfer USDT"
        );

        _safeMint(msg.sender, currentToken);
        currentToken++;
    }
}
