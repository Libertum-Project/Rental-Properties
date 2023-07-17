const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PropertyFactoryAndBank", function () {
  async function deployPropertyFactoryAndBank() {
    const [owner, user] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();

    const PropertyFactoryAndBank = await ethers.getContractFactory(
      "PropertyFactoryAndBank"
    );
    const propertyFactoryAndBank = await PropertyFactoryAndBank.deploy(
      "Test Property",
      "TP",
      100,
      1000,
      100000,
      500,
      mockUSDT.address
    );

    return { owner, user, deployPropertyFactoryAndBank, mockUSDT };
  }
});
