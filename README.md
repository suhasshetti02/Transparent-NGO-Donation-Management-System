# Web3-Based NGO Donation Platform with AI-Enhanced Verification

A transparent charitable donation platform built on Ethereum. It aims to solve the "Oracle Problem" in philanthropy by using a hybrid architecture where on-chain fund release is controlled by an AI-assisted audit of off-chain vendor invoices.

## 🚀 Overview

This project is a prototype demonstrating how decentralized smart contracts can interface with real-world documents using AI. 
- **Donors** can browse causes and pledge funds.
- **NGO Admins** upload invoices for milestones.
- **The System** runs OCR on the invoice and uses Google Gemini to verify the claimed amount against the document.
- **Platform Admins** vote to approve the AI's findings.
- **Smart Contracts** queue the payout and record the attestation on-chain.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Ethers.js
- **Backend**: Node.js, Express.js
- **Blockchain**: Solidity, Ethereum (Localhost / Sepolia), Hardhat
- **AI/ML**: Google Gemini 1.5 Flash
- **Storage**: IPFS (Pinata)
- **OCR**: Tesseract.js (Images), pdf-parse (PDFs)
- **Database**: Local JSON persistence (Prototype)

## 🏗️ Architecture

1. **Upload**: Admin uploads an invoice via the React frontend.
2. **Text Extraction**: The Express backend uses Tesseract.js/pdf-parse to extract raw text.
3. **AI Verification**: The text is sent to Google Gemini, which acts as a financial auditor to find the claimed amount and returns a credibility score.
4. **Storage**: The invoice and metadata are pinned to IPFS via Pinata.
5. **Governance**: Admins vote on the backend dashboard.
6. **Execution**: Upon a 2-vote quorum, the backend attests the AI decision to the `InvoiceVerifier` smart contract and queues a payout in the `Treasury` contract.

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MetaMask Browser Extension
- Alchemy/Infura RPC URL
- Google Gemini API Key
- Pinata API Keys

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
RPC_URL="http://127.0.0.1:8545" # Or Sepolia RPC
PRIVATE_KEY="YOUR_ADMIN_WALLET_PRIVATE_KEY"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
PINATA_API_KEY="YOUR_PINATA_API_KEY"
PINATA_SECRET_API_KEY="YOUR_PINATA_SECRET"
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Smart Contracts (Local Testing)

Open a terminal and start a local Hardhat node:
```bash
npx hardhat node
```
In another terminal, deploy the contracts:
```bash
npx hardhat run scripts/deploy_all_project.js --network localhost
```
*Note: Update the backend and frontend configurations with the deployed contract addresses.*

## 🚀 Running the Application

**Start the Backend:**
```bash
cd backend
node index.js
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```
Access the application at `http://localhost:5173`.

## ⚠️ Limitations & Known Issues
- **Authentication**: The backend API currently lacks authentication (e.g., JWT). Admin voting routes are open and rely on frontend trust.
- **Database**: Uses local JSON files (`data/causes.json`) for persistence rather than a production database.
- **Timelock**: The `Treasury.sol` contract enforces a 1-minute timelock. The backend attempts to execute the payout immediately after queueing, which will fail (caught safely). Execution must currently be done manually after the timelock expires.
- **Deployment**: Currently configured primarily for local development (Hardhat node), though Sepolia deployment is possible.

## 🔮 Future Improvements
- Migrate from local JSON to a robust database like MongoDB.
- Implement Web3 Wallet Signatures for secure admin API authentication.
- Create a cron job / event listener for automated payout execution post-timelock.
- Add comprehensive automated unit and integration tests.

## 👥 Contributors
- **Vijay Narayan Raikar** (RVCE)
- **Tarun R** (RVCE)
- **Suhas Shetti** (RVCE)
- **Nandini C** (RVCE)
- **K Y Hemalatha** (RVCE)

**Mentor**: Prof. Jayanthi P N

## 📄 License
MIT License
