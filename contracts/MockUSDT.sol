// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("USDT", "USDT") {
        // Mint 10k USDT to the deployer of the contract
        _mint(msg.sender, 10_000 * 10 ** 6);
    }

    function faucet(uint256 quantity) external {
        _mint(msg.sender, quantity * 10**6);
    }
}
