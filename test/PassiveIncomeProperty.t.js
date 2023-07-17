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
      const { passiveIncomeProperty } = await loadFixture(deployPassiveIncome);
      expect(passiveIncomeProperty.address).to.not.equal(0);
    });

    it("Should set the correct name", async function () {
      const { passiveIncomeProperty } = await loadFixture(deployPassiveIncome);
      expect(await passiveIncomeProperty.name()).to.equal("Test Property");
    });

    it("Should set the correct symbol", async function () {
      const { passiveIncomeProperty } = await loadFixture(deployPassiveIncome);
      expect(await passiveIncomeProperty.symbol()).to.equal("TP");
    });

    it("Should set the right owner", async function () {
      const { owner, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );
      expect(await passiveIncomeProperty.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow users to mint tokens for 1000 USDT", async function () {
      const { owner, passiveIncomeProperty, mockUSDT } = await loadFixture(
        deployPassiveIncome
      );

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
      expect(await passiveIncomeProperty.balanceOf(owner.address)).to.equal(1);
    });

    it("Should allow users to mint multiple tokens at once", async function () {
      const { owner, passiveIncomeProperty, mockUSDT } = await loadFixture(
        deployPassiveIncome
      );

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
      expect(await passiveIncomeProperty.balanceOf(owner.address)).to.equal(5);
    });

    it("Should revert if the user has not approved the contract to spend the required amount", async function () {
      const { owner, mockUSDT, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

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

  describe("Withdrawals", function () {
    it("Should allow the owner to withdraw USDT held on the contract", async function () {
      const { owner, mockUSDT, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      // Mint 1k USDT for the owner
      mockUSDT.connect(owner).faucet(1_000);

      // Mint 1 NFT for 1000 USDT
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await passiveIncomeProperty.mint(1);

      // Verify that owner's USDT balance is zero
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(0);

      // Withdraw USDT and verify owner's new USDT balance
      await passiveIncomeProperty.withdraw();
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("1000", 6)
      );
    });

    it("Should not allow non-owners to withdraw USDT held on the contract", async function () {
      const { user, mockUSDT, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      // Mint 1k USDT for the user
      mockUSDT.connect(user).faucet(1_000);

      // Mint 1 NFT for 1000 USDT
      await mockUSDT
        .connect(user)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await passiveIncomeProperty.connect(user).mint(1);

      // Verify that contract has 1000 USDT
      expect(await mockUSDT.balanceOf(passiveIncomeProperty.address)).to.equal(
        ethers.utils.parseUnits("1000", 6)
      );

      // Attempt to withdraw USDT and verify contract's USDT balance
      await expect(
        passiveIncomeProperty.connect(user).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
      expect(await mockUSDT.balanceOf(passiveIncomeProperty.address)).to.equal(
        ethers.utils.parseUnits("1000", 6)
      );
    });

    it("Should not allow withdrawals if the contract holds no balance", async function () {
      const { owner, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      // Attempt to withdraw USDT and verify contract's USDT balance
      await expect(passiveIncomeProperty.withdraw()).to.be.revertedWith(
        "PassiveIncomeProperty: no funds to withdraw"
      );
    });
  });

  describe("Starting and stopping payouts", function () {
    it("Should allow the owner to activate/deactivate a property", async function () {
      const { owner, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      expect(await passiveIncomeProperty.isActive()).to.equal(false);
      await passiveIncomeProperty.setActive();
      expect(await passiveIncomeProperty.isActive()).to.equal(true);
      await passiveIncomeProperty.setInactive();
      expect(await passiveIncomeProperty.isActive()).to.equal(false);
    });

    it("Should not allow a user to activate/deactivate a property", async function () {
      const { user, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      expect(await passiveIncomeProperty.isActive()).to.equal(false);
      await expect(
        passiveIncomeProperty.connect(user).setActive()
      ).to.be.revertedWith("Ownable: caller is not the owner");
      expect(await passiveIncomeProperty.isActive()).to.equal(false);
    });

    it("Should correctly set startTime when activating a property", async function () {
      const { owner, passiveIncomeProperty } = await loadFixture(
        deployPassiveIncome
      );

      await passiveIncomeProperty.setActive();
      const currentBlock = await ethers.provider.getBlock("latest");
      expect(await passiveIncomeProperty.startTime()).to.equal(
        currentBlock.timestamp
      );
    });

    it("Full repayment of loan should deactivate payouts", async function () {
      const { owner, user, passiveIncomeProperty, mockUSDT } =
        await loadFixture(deployPassiveIncome);

      // Mint 100k USDT for the owner and user
      mockUSDT.connect(owner).faucet(100_000);
      mockUSDT.connect(user).faucet(100_000);

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("100000", 6)
        );

      // Owner buys out the entire supply and activates payouts
      await passiveIncomeProperty.mint(100);
      await passiveIncomeProperty.setActive();

      // Verify that payouts are active
      expect(await passiveIncomeProperty.isActive()).to.equal(true);

      // User pays off the entire loan amount
      await mockUSDT
        .connect(user)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("100000", 6)
        );
      await passiveIncomeProperty.connect(user).repayLoan(100_000);

      // Verify that payouts are now inactive
      expect(await passiveIncomeProperty.isActive()).to.equal(false);
    });

    it("Partial repayment of loan shouldn't deactivate payouts but should reduce outstanding balance", async function () {
      const { owner, user, passiveIncomeProperty, mockUSDT } =
        await loadFixture(deployPassiveIncome);

      // Mint 100k USDT for the owner and user
      mockUSDT.connect(owner).faucet(100_000);
      mockUSDT.connect(user).faucet(100_000);

      // Approve USDT for the contract
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("100000", 6)
        );

      // Owner buys out the entire supply and activates payouts
      await passiveIncomeProperty.mint(100);
      await passiveIncomeProperty.setActive();

      // Verify that payouts are active
      expect(await passiveIncomeProperty.isActive()).to.equal(true);

      // User pays off the entire loan amount
      await mockUSDT
        .connect(user)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("50000", 6)
        );
      await passiveIncomeProperty.connect(user).repayLoan(50_000);

      // Verify that payouts are still inactive and outstanding balance is 50k
      expect(await passiveIncomeProperty.isActive()).to.equal(true);
      expect(await passiveIncomeProperty.unpaidAmount()).to.equal(50_000);
    });
  });
});
