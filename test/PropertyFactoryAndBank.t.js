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

  describe("Creating new capital repayment properties", function () {
    it("Should allow the owner to create a new capital repayment property", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new capital repayment property
      await propertyFactoryAndBank
        .connect(owner)
        .newCapitalRepaymentProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          12,
          500,
          mockUSDT.address
        );

      expect (await propertyFactoryAndBank.numCapitalRepaymentProperties()).to.equal(1);
    });
  });
});
