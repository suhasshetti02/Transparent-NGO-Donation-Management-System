const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy DonationRegistry
  const DonationRegistry = await hre.ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await DonationRegistry.deploy();
  await donationRegistry.waitForDeployment();
  const donationRegistryAddress = await donationRegistry.getAddress();
  console.log(`DonationRegistry deployed to: ${donationRegistryAddress}`);

  // 2. Deploy CauseManager
  const CauseManager = await hre.ethers.getContractFactory("CauseManager");
  const causeManager = await CauseManager.deploy();
  await causeManager.waitForDeployment();
  const causeManagerAddress = await causeManager.getAddress();
  console.log(`CauseManager deployed to: ${causeManagerAddress}`);

  // 3. Deploy Treasury
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log(`Treasury deployed to: ${treasuryAddress}`);

  // 4. Deploy InvoiceVerifier
  const InvoiceVerifier = await hre.ethers.getContractFactory("InvoiceVerifier");
  const invoiceVerifier = await InvoiceVerifier.deploy();
  await invoiceVerifier.waitForDeployment();
  const invoiceVerifierAddress = await invoiceVerifier.getAddress();
  console.log(`InvoiceVerifier deployed to: ${invoiceVerifierAddress}`);

  console.log("\n--- Deployment Summary ---");
  const envContent = `RPC_URL="https://eth-sepolia.g.alchemy.com/v2/JMvWzVj_d4rY1EQMYsOx-"
PRIVATE_KEY="0x49dad3db718463305d3e186afa38f4a082bebdc5d99221b54cdfae3051075f8b"
PINATA_JWT="${process.env.PINATA_JWT || ''}"

DONATION_REGISTRY="${donationRegistryAddress}"
CAUSE_MANAGER="${causeManagerAddress}"
TREASURY="${treasuryAddress}"
INVOICE_VERIFIER="${invoiceVerifierAddress}"
`;

  const fs = require('fs');
  const path = require('path');
  
  // Write to backend/.env
  const backendEnvPath = path.join(__dirname, "../backend/.env");
  fs.writeFileSync(backendEnvPath, envContent);
  console.log(`\n✅ Configuration written to: ${backendEnvPath}`);
  
  // Also update root .env for consistency if needed, but backend is priority
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
