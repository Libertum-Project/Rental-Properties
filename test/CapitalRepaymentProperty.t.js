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
      100,
      1000,
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
    it("Should allow users to mint tokens for 1000 USDT", async function () {
      const { owner, capitalRepaymentProperty, mockUSDT } =
        await deployCapitalRepaymentFixture();

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Mint 1 NFT for 1000 USDT
      await capitalRepaymentProperty.mint(1);
      expect(await capitalRepaymentProperty.balanceOf(owner.address)).to.equal(
        1
      );
    });

    it("Should allow users to mint multiple tokens at once", async function () {
      const { owner, capitalRepaymentProperty, mockUSDT } =
        await deployCapitalRepaymentFixture();

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("5000", 6)
        );

      // Mint 5 NFTs for 5000 USDT
      await capitalRepaymentProperty.mint(5);
      expect(await capitalRepaymentProperty.balanceOf(owner.address)).to.equal(
        5
      );
    });

    it("Should revert if the user has not approved the contract to spend the required amount", async function () {
      const { owner, capitalRepaymentProperty } =
        await deployCapitalRepaymentFixture();

      // Mint 1 NFT for 1000 USDT
      await expect(capitalRepaymentProperty.mint(1)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      );
    });

    it("Should revert if the supply has been sold out", async function () {
      const { owner, mockUSDT, capitalRepaymentProperty } = await loadFixture(deployCapitalRepaymentFixture);

      // Mint 1M USDT for the owner
      mockUSDT.connect(owner).faucet(1_000_000);

      // Approve USDT for the contract
      await mockUSDT
      .connect(owner)
      .approve(
        capitalRepaymentProperty.address,
        ethers.utils.parseUnits("1001000", 6)
      );

      // Mint 101 NFTs (1 over total supply)
      await expect(capitalRepaymentProperty.mint(101)).to.be.revertedWith(
        "CapitalRepaymentProperty: tokens sold out"
      );
    });
  });
});
