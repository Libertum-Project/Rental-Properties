const hre = require("hardhat");

async function main() {
  // Deploy property factory and bank contract
  const PropertyFactoryAndBank = await hre.ethers.getContractFactory(
    "PropertyFactoryAndBank"
  );
  const propertyFactoryAndBank = await PropertyFactoryAndBank.deploy();

  // Wait for the contract to be mined
  await propertyFactoryAndBank.deployed();

  console.log(
    "Property Factory and Bank contract deployed to:",
    propertyFactoryAndBank.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
