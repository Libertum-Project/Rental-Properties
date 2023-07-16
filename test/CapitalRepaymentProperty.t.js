const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CapitalRepaymentProperty", function () {
  async function deployCapitalRepaymentFixture() {
    const CapitalRepaymentProperty = await ethers.getContractFactory(
      "CapitalRepaymentProperty"
    );
    const capitalRepaymentProperty = await CapitalRepaymentProperty.deploy();

    return capitalRepaymentProperty;
  }
});
