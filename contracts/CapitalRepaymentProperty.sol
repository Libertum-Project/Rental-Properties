// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CapitalRepaymentProperty is ERC721 {
    uint256 currentToken;
    uint256 totalSupply;
    uint256 pricePerToken;
    uint256 collateralizedValue;
    uint256 durationInMonths;
    uint256 interestRate;

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
    }

    function mint() external {
        require(currentToken < totalSupply, "All NFTs have been minted");
        _safeMint(msg.sender, currentToken);
        currentToken++;
    }
}
