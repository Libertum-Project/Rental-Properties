const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CapitalRepaymentProperty", function () {
  async function deployCapitalRepayment() {
    const [owner, user] = await ethers.getSigners();

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

    return { owner, user, capitalRepaymentProperty, mockUSDT };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );
      expect(capitalRepaymentProperty.address).to.not.equal(0);
    });

    it("Should set the correct name", async function () {
      const { capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );
      expect(await capitalRepaymentProperty.name()).to.equal("Test Property");
    });

    it("Should set the correct symbol", async function () {
      const { capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );
      expect(await capitalRepaymentProperty.symbol()).to.equal("TP");
    });

    it("Should set the right owner", async function () {
      const { owner, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );
      expect(await capitalRepaymentProperty.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow users to mint tokens for 1000 USDT", async function () {
      const { owner, capitalRepaymentProperty, mockUSDT } = await loadFixture(
        deployCapitalRepayment
      );

      // Mint 1k USDT for the owner
      mockUSDT.connect(owner).faucet(1_000);

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
      const { owner, capitalRepaymentProperty, mockUSDT } = await loadFixture(
        deployCapitalRepayment
      );

      // Mint 5k USDT for the owner
      mockUSDT.connect(owner).faucet(5_000);

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
      const { owner, mockUSDT, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      // Mint 1k USDT for the owner
      mockUSDT.connect(owner).faucet(1_000);

      // Mint 1 NFT for 1000 USDT
      await expect(capitalRepaymentProperty.mint(1)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      );
    });

    it("Should revert if the supply has been sold out", async function () {
      const { owner, mockUSDT, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

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

  describe("Withdrawals", function () {
    it("Should allow the owner to withdraw USDT held on the contract", async function () {
      const { owner, mockUSDT, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      // Mint 1k USDT for the owner
      mockUSDT.connect(owner).faucet(1_000);

      // Mint 1 NFT for 1000 USDT
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await capitalRepaymentProperty.mint(1);

      // Verify that owner's USDT balance is zero
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(0);

      // Withdraw USDT and verify owner's new USDT balance
      await capitalRepaymentProperty.withdraw(owner.address);
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("1000", 6)
      );
    });

    it("Should not allow non-owners to withdraw USDT held on the contract", async function () {
      const { user, mockUSDT, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      // Mint 1k USDT for the user
      mockUSDT.connect(user).faucet(1_000);

      // Mint 1 NFT for 1000 USDT
      await mockUSDT
        .connect(user)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await capitalRepaymentProperty.connect(user).mint(1);

      // Verify that contract has 1000 USDT
      expect(
        await mockUSDT.balanceOf(capitalRepaymentProperty.address)
      ).to.equal(ethers.utils.parseUnits("1000", 6));

      // Attempt to withdraw USDT and verify contract's USDT balance
      await expect(
        capitalRepaymentProperty.connect(user).withdraw(user.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      expect(
        await mockUSDT.balanceOf(capitalRepaymentProperty.address)
      ).to.equal(ethers.utils.parseUnits("1000", 6));
    });

    it("Should not allow withdrawals if the contract holds no balance", async function () {
      const { owner, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      // Attempt to withdraw USDT and verify contract's USDT balance
      await expect(
        capitalRepaymentProperty.withdraw(owner.address)
      ).to.be.revertedWith("CapitalRepaymentProperty: no funds to withdraw");
    });
  });

  describe("Starting and stopping payouts", function () {
    it("Should allow the owner to activate/deactivate a property", async function () {
      const { owner, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      expect(await capitalRepaymentProperty.isActive()).to.equal(false);
      await capitalRepaymentProperty.setActive();
      expect(await capitalRepaymentProperty.isActive()).to.equal(true);
      await capitalRepaymentProperty.setInactive();
      expect(await capitalRepaymentProperty.isActive()).to.equal(false);
    });

    it("Should not allow a user to activate/deactivate a property", async function () {
      const { user, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      expect(await capitalRepaymentProperty.isActive()).to.equal(false);
      await expect(
        capitalRepaymentProperty.connect(user).setActive()
      ).to.be.revertedWith("Ownable: caller is not the owner");
      expect(await capitalRepaymentProperty.isActive()).to.equal(false);
    });

    it("Should correctly set startTime when activating a property", async function () {
      const { owner, capitalRepaymentProperty } = await loadFixture(
        deployCapitalRepayment
      );

      // Get latest block time and compare to the one recently set
      await capitalRepaymentProperty.setActive();
      const currentBlock = await ethers.provider.getBlock("latest");
      expect(await capitalRepaymentProperty.startTime()).to.equal(
        currentBlock.timestamp
      );
    });
  });
});
