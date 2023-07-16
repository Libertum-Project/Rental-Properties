const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PassiveIncomeProperty", function () {
  async function deployPassiveIncomeFixture() {
    const [owner, user] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();

    const PassiveIncomeProperty = await ethers.getContractFactory(
      "PassiveIncomeProperty"
    );
    const passiveIncomeProperty = await PassiveIncomeProperty.deploy(
      "Test Property",
      "TP",
      100,
      1000,
      100000,
      500,
      mockUSDT.address
    );

    return { owner, user, passiveIncomeProperty, mockUSDT };
  }
});
