const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CapitalRepaymentProperty", function () {
  async function deployCapitalRepaymentFixture() {
    const [owner] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();

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
      500,
      mockUSDT.address
    );

    return { owner, capitalRepaymentProperty, mockUSDT };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { capitalRepaymentProperty } =
        await deployCapitalRepaymentFixture();
      expect(capitalRepaymentProperty.address).to.not.equal(0);
    });

    it("Should set the correct name", async function () {
      const { capitalRepaymentProperty } =
        await deployCapitalRepaymentFixture();
      expect(await capitalRepaymentProperty.name()).to.equal("Test Property");
    });

    it("Should set the correct symbol", async function () {
      const { capitalRepaymentProperty } =
        await deployCapitalRepaymentFixture();
      expect(await capitalRepaymentProperty.symbol()).to.equal("TP");
    });
  });

  describe("Minting", function () {
    it("Should allow users to mint tokens for 100 USDT", async function () {
      const { owner, capitalRepaymentProperty, mockUSDT } =
        await deployCapitalRepaymentFixture();

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("100", 6)
        );

      // Mint 1 NFT for 100 USDT
      await capitalRepaymentProperty.mint(1);
      expect(await capitalRepaymentProperty.balanceOf(owner.address)).to.equal(
        1
      );
    });
  });
});
