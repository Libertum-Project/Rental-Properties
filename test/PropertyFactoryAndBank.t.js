const { expect } = require("chai");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

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

      expect(
        await propertyFactoryAndBank.numCapitalRepaymentProperties()
      ).to.equal(1);
    });

    it("Should not allow a user to create a new capital repayment property", async function () {
      const { user, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new capital repayment property
      await expect(
        propertyFactoryAndBank
          .connect(user)
          .newCapitalRepaymentProperty(
            "Test Property",
            "TP",
            100,
            1000,
            100000,
            12,
            500,
            mockUSDT.address
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should store the addresses of all properties created", async function () {
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

      // Verify that the array is the correct length and each element does not contain
      // the zero address.
      const numProperties =
        await propertyFactoryAndBank.numCapitalRepaymentProperties();
      expect(numProperties).to.equal(2);

      for (let i = 0; i < numProperties; i++) {
        let propertyAddress =
          await propertyFactoryAndBank.capitalRepaymentProperties(i);
        expect(propertyAddress).to.not.equal(0);
      }
    });

    it("Created properties should have the correct variables", async function () {
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

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.capitalRepaymentProperties(
        0
      );
      const CapitalRepaymentProperty = await ethers.getContractFactory(
        "CapitalRepaymentProperty"
      );
      const capitalRepaymentProperty = await CapitalRepaymentProperty.attach(
        address
      );

      // Verify that the contract has the correct variables
      expect(await capitalRepaymentProperty.name()).to.equal("Test Property");
      expect(await capitalRepaymentProperty.symbol()).to.equal("TP");
      expect(await capitalRepaymentProperty.totalSupply()).to.equal(100);
      expect(await capitalRepaymentProperty.pricePerToken()).to.equal(1000);
      expect(await capitalRepaymentProperty.collateralizedValue()).to.equal(
        100000
      );
      expect(await capitalRepaymentProperty.durationInMonths()).to.equal(12);
      expect(await capitalRepaymentProperty.interestRate()).to.equal(500);
      expect(await capitalRepaymentProperty.paymentToken()).to.equal(
        mockUSDT.address
      );
    });

    it("Should correctly emit an event for each created property", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new capital repayment property and check for event emission
      await expect(
        propertyFactoryAndBank
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
          )
      ).to.emit(propertyFactoryAndBank, "CapitalRepaymentPropertyCreated");
    });
  });

  describe("Creating new passive income properties", function () {
    it("Should allow the owner to create a new passive income property", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new passive income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          500,
          mockUSDT.address
        );

      expect(
        await propertyFactoryAndBank.numPassiveIncomeProperties()
      ).to.equal(1);
    });

    it("Should not allow a user to create a new passive income property", async function () {
      const { user, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new passive income property
      await expect(
        propertyFactoryAndBank
          .connect(user)
          .newPassiveIncomeProperty(
            "Test Property",
            "TP",
            100,
            1000,
            100000,
            500,
            mockUSDT.address
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should store the addresses of all properties created", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new passive income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          500,
          mockUSDT.address
        );

      // Create a new passive income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          500,
          mockUSDT.address
        );

      // Verify that the array is the correct length and each element does not contain
      // the zero address.
      const numProperties =
        await propertyFactoryAndBank.numPassiveIncomeProperties();
      expect(numProperties).to.equal(2);

      for (let i = 0; i < numProperties; i++) {
        let propertyAddress =
          await propertyFactoryAndBank.passiveIncomeProperties(i);
        expect(propertyAddress).to.not.equal(0);
      }
    });

    it("Created properties should have the correct variables", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new passive income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          500,
          mockUSDT.address
        );

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.passiveIncomeProperties(0);
      const PassiveIncomeProperty = await ethers.getContractFactory(
        "PassiveIncomeProperty"
      );
      const passiveIncomeProperty = await PassiveIncomeProperty.attach(address);

      // Verify that the contract has the correct variables
      expect(await passiveIncomeProperty.name()).to.equal("Test Property");
      expect(await passiveIncomeProperty.symbol()).to.equal("TP");
      expect(await passiveIncomeProperty.totalSupply()).to.equal(100);
      expect(await passiveIncomeProperty.pricePerToken()).to.equal(1000);
      expect(await passiveIncomeProperty.collateralizedValue()).to.equal(
        100000
      );
      expect(await passiveIncomeProperty.interestRate()).to.equal(500);
      expect(await passiveIncomeProperty.paymentToken()).to.equal(
        mockUSDT.address
      );
    });

    it("Should correctly emit an event for each created property", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new passive income property and check for event emission
      await expect(
        propertyFactoryAndBank
          .connect(owner)
          .newPassiveIncomeProperty(
            "Test Property",
            "TP",
            100,
            1000,
            100000,
            500,
            mockUSDT.address
          )
      ).to.emit(propertyFactoryAndBank, "PassiveIncomePropertyCreated");
    });
  });

  describe("Claiming monthly payouts", function () {
    it("(Capital Repayment) Should not allow a user to claim monthly payouts for inactive properties", async function () {
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

      // Mint 1000 USDT to owner
      await mockUSDT.connect(owner).faucet(1_000);

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.capitalRepaymentProperties(
        0
      );
      const CapitalRepaymentProperty = await ethers.getContractFactory(
        "CapitalRepaymentProperty"
      );
      const capitalRepaymentProperty = await CapitalRepaymentProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await capitalRepaymentProperty.connect(owner).mint(1);

      // Try to claim monthly payouts
      await expect(
        propertyFactoryAndBank
          .connect(owner)
          .claimCapitalRepayment(address, [0])
      ).to.be.revertedWith("PropertyFactoryAndBank: property is not active");
    });

    it("(Capital Repayment) Should not allow a user to claim monthly payouts if contract has insufficient funds", async function () {
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

      // Mint 1000 USDT to owner
      await mockUSDT.connect(owner).faucet(1_000);

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.capitalRepaymentProperties(
        0
      );
      const CapitalRepaymentProperty = await ethers.getContractFactory(
        "CapitalRepaymentProperty"
      );
      const capitalRepaymentProperty = await CapitalRepaymentProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await capitalRepaymentProperty.connect(owner).mint(1);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActiveCapitalRepayment(address);

      // Increase time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Attempt to claim
      await expect(
        propertyFactoryAndBank
          .connect(owner)
          .claimCapitalRepayment(address, [0])
      ).to.be.revertedWith("PropertyFactoryAndBank: insufficient funds");
    });

    it("(Capital Repayment) Should not allow a user to claim monthly payouts if insufficient time has elapsed", async function () {
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

      // Mint 2k USDT to owner and transfer 1k to contract
      await mockUSDT.connect(owner).faucet(2_000);
      await mockUSDT
        .connect(owner)
        .transfer(
          propertyFactoryAndBank.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.capitalRepaymentProperties(
        0
      );
      const CapitalRepaymentProperty = await ethers.getContractFactory(
        "CapitalRepaymentProperty"
      );
      const capitalRepaymentProperty = await CapitalRepaymentProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await capitalRepaymentProperty.connect(owner).mint(1);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActiveCapitalRepayment(address);

      // Attempt to claim
      await expect(
        propertyFactoryAndBank
          .connect(owner)
          .claimCapitalRepayment(address, [0])
      ).to.be.revertedWith("PropertyFactoryAndBank: payout not ready");
    });

    it("(Capital Repayment) Should allow a user to claim monthly payouts if sufficient time has elapsed", async function () {
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

      // Mint 2k USDT to owner and transfer 1k to contract
      await mockUSDT.connect(owner).faucet(2_000);
      await mockUSDT
        .connect(owner)
        .transfer(
          propertyFactoryAndBank.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.capitalRepaymentProperties(
        0
      );
      const CapitalRepaymentProperty = await ethers.getContractFactory(
        "CapitalRepaymentProperty"
      );
      const capitalRepaymentProperty = await CapitalRepaymentProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await capitalRepaymentProperty.connect(owner).mint(1);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActiveCapitalRepayment(address);

      // Increase time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Attempt to claim
      await propertyFactoryAndBank
        .connect(owner)
        .claimCapitalRepayment(address, [0]);

      expect(await mockUSDT.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("87", 6)
      );
    });

    it("(Capital Repayment) Should allow a user to claim monthly payouts for multiple tokens at once", async function () {
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

      // Mint 3k USDT to owner and transfer 1k to contract
      await mockUSDT.connect(owner).faucet(3_000);
      await mockUSDT
        .connect(owner)
        .transfer(
          propertyFactoryAndBank.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.capitalRepaymentProperties(
        0
      );
      const CapitalRepaymentProperty = await ethers.getContractFactory(
        "CapitalRepaymentProperty"
      );
      const capitalRepaymentProperty = await CapitalRepaymentProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          capitalRepaymentProperty.address,
          ethers.utils.parseUnits("2000", 6)
        );
      await capitalRepaymentProperty.connect(owner).mint(2);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActiveCapitalRepayment(address);

      // Increase time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Attempt to claim
      await propertyFactoryAndBank
        .connect(owner)
        .claimCapitalRepayment(address, [0, 1]);

      expect(await mockUSDT.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("174", 6)
      );
    });

    it("(Passive Income) Should not allow a user to claim monthly payouts for inactive properties", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new Passive Income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          50,
          mockUSDT.address
        );

      // Mint 1000 USDT to owner
      await mockUSDT.connect(owner).faucet(1_000);

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.passiveIncomeProperties(0);
      const PassiveIncomeProperty = await ethers.getContractFactory(
        "PassiveIncomeProperty"
      );
      const passiveIncomeProperty = await PassiveIncomeProperty.attach(address);

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await passiveIncomeProperty.connect(owner).mint(1);

      // Try to claim monthly payouts
      await expect(
        propertyFactoryAndBank
          .connect(owner)
          .claimCapitalRepayment(address, [0])
      ).to.be.revertedWith("PropertyFactoryAndBank: property is not active");
    });

    it("(Passive Income) Should not allow a user to claim monthly payouts if contract has insufficient funds", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new Passive Income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          50,
          mockUSDT.address
        );

      // Mint 1000 USDT to owner
      await mockUSDT.connect(owner).faucet(1_000);

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.passiveIncomeProperties(0);
      const PassiveIncomeProperty = await ethers.getContractFactory(
        "PassiveIncomeProperty"
      );
      const passiveIncomeProperty = await PassiveIncomeProperty.attach(address);

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await passiveIncomeProperty.connect(owner).mint(1);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActivePassiveIncome(address);

      // Increase time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Attempt to claim
      await expect(
        propertyFactoryAndBank.connect(owner).claimPassiveIncome(address, [0])
      ).to.be.revertedWith("PropertyFactoryAndBank: insufficient funds");
    });

    it("(Passive Income) Should not allow a user to claim monthly payouts if insufficient time has elapsed", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new Passive Income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          50,
          mockUSDT.address
        );

      // Mint 2k USDT to owner and transfer 1k to contract
      await mockUSDT.connect(owner).faucet(2_000);
      await mockUSDT
        .connect(owner)
        .transfer(
          propertyFactoryAndBank.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.passiveIncomeProperties(
        0
      );
      const PassiveIncomeProperty = await ethers.getContractFactory(
        "PassiveIncomeProperty"
      );
      const passiveIncomeProperty = await PassiveIncomeProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await passiveIncomeProperty.connect(owner).mint(1);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActivePassiveIncome(address);

      // Attempt to claim
      await expect(
        propertyFactoryAndBank
          .connect(owner)
          .claimPassiveIncome(address, [0])
      ).to.be.revertedWith("PropertyFactoryAndBank: payout not ready");
    });

    it("(Passive Income) Should allow a user to claim monthly payouts if sufficient time has elapsed", async function () {
      const { owner, propertyFactoryAndBank, mockUSDT } = await loadFixture(
        deployPropertyFactoryAndBank
      );

      // Create a new Passive Income property
      await propertyFactoryAndBank
        .connect(owner)
        .newPassiveIncomeProperty(
          "Test Property",
          "TP",
          100,
          1000,
          100000,
          50,
          mockUSDT.address
        );

      // Mint 2k USDT to owner and transfer 1k to contract
      await mockUSDT.connect(owner).faucet(2_000);
      await mockUSDT
        .connect(owner)
        .transfer(
          propertyFactoryAndBank.address,
          ethers.utils.parseUnits("1000", 6)
        );

      // Create contract instance from stored address
      const address = await propertyFactoryAndBank.passiveIncomeProperties(
        0
      );
      const PassiveIncomeProperty = await ethers.getContractFactory(
        "PassiveIncomeProperty"
      );
      const passiveIncomeProperty = await PassiveIncomeProperty.attach(
        address
      );

      // Buy a token
      await mockUSDT
        .connect(owner)
        .approve(
          passiveIncomeProperty.address,
          ethers.utils.parseUnits("1000", 6)
        );
      await passiveIncomeProperty.connect(owner).mint(1);

      // Activate the property
      await propertyFactoryAndBank
        .connect(owner)
        .setActivePassiveIncome(address);

      // Increase time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Attempt to claim
      await propertyFactoryAndBank
        .connect(owner)
        .claimPassiveIncome(address, [0]);

      expect(await mockUSDT.balanceOf(owner.address)).to.equal(
        ethers.utils.parseUnits("5", 6)
      );
    });
  });
});
