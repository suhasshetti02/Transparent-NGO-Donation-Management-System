const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting deployment to Sepolia (from NGO-Donations)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // 1. Deploy DonationRegistry
  console.log("1️⃣  Deploying DonationRegistry...");
  const DonationRegistry = await hre.ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await DonationRegistry.deploy();
  await donationRegistry.waitForDeployment();
  const donationRegistryAddress = await donationRegistry.getAddress();
  console.log(`   ✅ DonationRegistry deployed to: ${donationRegistryAddress}\n`);

  // 2. Deploy CauseManager
  console.log("2️⃣  Deploying CauseManager...");
  const CauseManager = await hre.ethers.getContractFactory("CauseManager");
  const causeManager = await CauseManager.deploy();
  await causeManager.waitForDeployment();
  const causeManagerAddress = await causeManager.getAddress();
  console.log(`   ✅ CauseManager deployed to: ${causeManagerAddress}\n`);

  // 3. Deploy Treasury
  console.log("3️⃣  Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log(`   ✅ Treasury deployed to: ${treasuryAddress}\n`);

  // 4. Deploy InvoiceVerifier
  console.log("4️⃣  Deploying InvoiceVerifier...");
  const InvoiceVerifier = await hre.ethers.getContractFactory("InvoiceVerifier");
  const invoiceVerifier = await InvoiceVerifier.deploy();
  await invoiceVerifier.waitForDeployment();
  const invoiceVerifierAddress = await invoiceVerifier.getAddress();
  console.log(`   ✅ InvoiceVerifier deployed to: ${invoiceVerifierAddress}\n`);

  // Create addresses object
  const addresses = {
    DonationRegistry: donationRegistryAddress,
    CauseManager: causeManagerAddress,
    Treasury: treasuryAddress,
    InvoiceVerifier: invoiceVerifierAddress
  };

  // Write to ../project/lib/blockchain/addresses.json
  // We are in NGO-Donations/scripts, so we go up one level to NGO-Donations, then up to root, then down to project
  const addressesPath = path.join(__dirname, "../../project/lib/blockchain/addresses.json");
  
  // Ensure directory exists
  const dir = path.dirname(addressesPath);
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployed Contract Addresses:\n");
  console.log(`   DonationRegistry: ${donationRegistryAddress}`);
  console.log(`   CauseManager:     ${causeManagerAddress}`);
  console.log(`   Treasury:         ${treasuryAddress}`);
  console.log(`   InvoiceVerifier:  ${invoiceVerifierAddress}`);
  console.log(`\n✅ Addresses saved to: ${addressesPath}`);
  console.log("\n🔗 Verify on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${donationRegistryAddress}`);
  console.log(`   https://sepolia.etherscan.io/address/${causeManagerAddress}`);
  console.log(`   https://sepolia.etherscan.io/address/${treasuryAddress}`);
  console.log(`   https://sepolia.etherscan.io/address/${invoiceVerifierAddress}`);
  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
