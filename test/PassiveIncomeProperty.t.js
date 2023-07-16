const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PassiveIncomeProperty", function () {
  async function deployPassiveIncome() {
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

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { passiveIncomeProperty } =
        await loadFixture(deployPassiveIncome);
      expect(passiveIncomeProperty.address).to.not.equal(0);
    });

    it("Should set the correct name", async function () {
      const { passiveIncomeProperty } =
        await loadFixture(deployPassiveIncome);
      expect(await passiveIncomeProperty.name()).to.equal("Test Property");
    });

    it("Should set the correct symbol", async function () {
      const { passiveIncomeProperty } =
        await loadFixture(deployPassiveIncome);
      expect(await passiveIncomeProperty.symbol()).to.equal("TP");
    });
  });

  describe("Minting", function () {
    it("Should allow users to mint tokens for 1000 USDT", async function () {
      const { owner, passiveIncomeProperty, mockUSDT } =
        await loadFixture(deployPassiveIncome);

      // Mint 1k USDT for the owner
      mockUSDT.connect(owner).faucet(1_000);

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Mint 1 NFT for 1000 USDT
      await passiveIncomeProperty.mint(1);
      expect(await passiveIncomeProperty.balanceOf(owner.address)).to.equal(
        1
      );
    });

    it("Should allow users to mint multiple tokens at once", async function () {
      const { owner, passiveIncomeProperty, mockUSDT } =
        await loadFixture(deployPassiveIncome);

      // Mint 5k USDT for the owner
      mockUSDT.connect(owner).faucet(5_000);

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("5000", 6)
        );

      // Mint 5 NFTs for 5000 USDT
      await passiveIncomeProperty.mint(5);
      expect(await passiveIncomeProperty.balanceOf(owner.address)).to.equal(
        5
      );
    });

    it("Should revert if the user has not approved the contract to spend the required amount", async function () {
      const { owner, mockUSDT, passiveIncomeProperty } =
        await loadFixture(deployPassiveIncome);

      // Mint 1k USDT for the owner
      mockUSDT.connect(owner).faucet(1_000);

      // Mint 1 NFT for 1000 USDT
      await expect(passiveIncomeProperty.mint(1)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      );
    });

    it("Should revert if the supply has been sold out", async function () {
      const { owner, mockUSDT, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      // Mint 1M USDT for the owner
      mockUSDT.connect(owner).faucet(1_000_000);

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1001000", 6)
        );

      // Mint 101 NFTs (1 over total supply)
      await expect(passiveIncomeProperty.mint(101)).to.be.revertedWith(
        "PassiveIncomeProperty: tokens sold out"
      );
    });
  });
});
