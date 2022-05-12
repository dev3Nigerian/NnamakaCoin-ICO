const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { ODIGBO_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const odigboNFTContract = ODIGBO_NFT_CONTRACT_ADDRESS;

  const odigboTokenContract = await ethers.getContractFactory(
    "OdigboToken"
  );

  // deploy the contract
  const deployedOdigboTokenContract = await odigboTokenContract.deploy(
    odigboNFTContract
  );

  console.log(
    "Odigbo Token Contract Address:", deployedOdigboTokenContract.address
  );
}

// call the main function and catch if there is any errors
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });