# Transparent NGO Donation Management System

A prototype donation-management platform that combines an Ethereum smart-contract workflow with invoice document extraction and AI-assisted review. Donors can explore causes; administrators can manage milestones, review invoices, and initiate vendor payouts.

> **Project status:** Prototype for local development / demonstration. The current backend uses JSON files for application state and exposes administrative routes without authentication. It is not suitable for handling real donations or financial credentials without further security work.

## Features implemented

- Cause and milestone creation, with milestone-to-invoice association.
- Invoice upload through the Express API.
- Text extraction using Tesseract.js for images and `pdf-parse` for PDFs.
- Gemini-assisted comparison of the claimed invoice amount with extracted invoice details.
- Invoice and verification bundle uploads through Pinata/IPFS helpers.
- Two-vote approval quorum in the backend invoice flow.
- Solidity contracts for cause/donation records, invoice attestations, and time-locked treasury payouts.
- React/Vite pages for donor, cause, invoice, transparency, and administrator workflows.

## Architecture

| Layer | Implementation |
|---|---|
| Web client | React, Vite, ethers.js |
| API | Node.js, Express, Multer |
| Document processing | Tesseract.js, pdf-parse |
| AI review | Google Gemini API |
| Off-chain file storage | Pinata / IPFS integration |
| Smart contracts | Solidity 0.8.24, Hardhat, ethers.js |
| Application persistence | Local JSON files in the backend |

The invoice path is: upload → OCR/PDF text extraction → Gemini review → IPFS upload → backend invoice record → administrator votes → contract attestation and payout queue. The `Treasury` contract enforces a one-minute timelock.

## Repository layout

- `frontend/` — Vite React application.
- `backend/` — Express API, invoice flow, OCR, Gemini, IPFS helpers, and JSON data.
- `contracts/` — Solidity contracts, including `Treasury.sol`, `InvoiceVerifier.sol`, and `DonationRegistry.sol`.
- `scripts/` — Hardhat deployment scripts.
- `test/` — Hardhat tests; the checked-in test is currently the generated `Lock` example, not a complete business-flow test suite.

## Run locally

Requirements: Node.js 18+, npm, a browser wallet such as MetaMask, and API credentials for the integrations you intend to use.

1. Install root Hardhat dependencies: `npm install`.
2. Install client dependencies: `cd frontend && npm install`.
3. Install API dependencies: `cd backend && npm install`.
4. Start a local chain in a terminal: `npx hardhat node`.
5. Deploy the contracts from the repository root: `npx hardhat run scripts/deploy_all_project.js --network localhost`.
6. Configure contract addresses and API credentials in the backend environment.
7. Start the API: `cd backend && node index.js` (port 3000).
8. Start the web client: `cd frontend && npm run dev` (Vite default port).

The exact contract addresses must be updated after each local deployment. Do not commit `.env` files or wallet private keys.

## API routes observed in the backend

- `GET /config`
- `POST /causes`, `POST /milestones`
- `POST /invoice`
- `POST /invoice/:id/vote`, `POST /invoice/:id/reject`
- `POST /payout/:id/execute`
- `POST /donate-sync`
- `GET /invoices`, `GET /admin/dashboard`

## Important limitations and follow-up work

- Backend routes currently have no authentication or authorization middleware; vote identity is supplied by the request body.
- Cause, milestone, and invoice state is stored in local JSON files, not a transactional database.
- The backend enables permissive CORS and does not yet demonstrate robust upload size/type validation.
- The contract timelock means payout execution cannot succeed immediately after queueing. The current API exposes a manual execution route.
- Root and backend `npm test` scripts are placeholders; the checked-in Hardhat test is not an end-to-end donation/invoice test.
- The conversion from INR to ETH in the invoice flow is a fixed demonstration rate. It must not be treated as a live exchange-rate feed.

## License

See the repository files for the applicable license and third-party component terms.
