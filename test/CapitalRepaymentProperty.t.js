const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CapitalRepaymentProperty", function () {
  async function deployCapitalRepaymentFixture() {
    const CapitalRepaymentProperty = await ethers.getContractFactory(
      "CapitalRepaymentProperty"
    );
    const capitalRepaymentProperty = await CapitalRepaymentProperty.deploy(
      "Test Property",
      "TP",
      1000,
      100,
      100000,
      12,
      5
    );

    return capitalRepaymentProperty;
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const capitalRepaymentProperty = await deployCapitalRepaymentFixture();
      expect(capitalRepaymentProperty.address).to.not.equal(0);
    });
  });
});
