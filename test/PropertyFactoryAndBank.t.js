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
    const propertyFactoryAndBank = await PropertyFactoryAndBank.deploy();

    return { owner, user, propertyFactoryAndBank, mockUSDT };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { propertyFactoryAndBank } = await loadFixture(
        deployPropertyFactoryAndBank
      );
      expect(propertyFactoryAndBank.address).to.not.equal(0);
    });

    it("Should set the right owner", async function () {
      const { owner, propertyFactoryAndBank } = await loadFixture(
        deployPropertyFactoryAndBank
      );
      expect(await propertyFactoryAndBank.owner()).to.equal(owner.address);
    });
  });
});
