# 1. Project Overview

- **Project Name:** Web3-Based NGO Donation Platform with AI-Enhanced Verification
- **One-line Description:** A transparent charitable donation platform using smart contracts for fund management and AI (Gemini) for auditing invoice claims before automated payouts.
- **Problem Statement:** Philanthropy often suffers from the "Oracle Problem"—how can smart contracts verify off-chain real-world events (like whether a vendor actually delivered goods or services) before releasing funds?
- **Motivation:** To bring transparency and trust to NGO donations, ensuring funds are strictly used for verified milestones rather than misallocated.
- **Target Users:** Donors looking for transparency, NGOs managing funds, and platform administrators governing payouts.
- **Objective:** Create an end-to-end decentralized donation pipeline where funds are escrowed and released only upon multi-sig admin approval backed by an AI-audited vendor invoice.
- **Current Implementation Status:** Proof-of-concept / Prototype.
- **What is Complete:** Smart contracts (Donation, Treasury, InvoiceVerifier, CauseManager), basic frontend (React), backend API (Express) with local JSON persistence, OCR pipeline (Tesseract/pdf-parse), AI verification (Gemini), IPFS storage (Pinata).
- **What is Incomplete:** Full production deployment, robust error handling, actual user authentication for admins (currently relies on frontend state or assumes trust in the local backend).
- **What is Simulated:** The "Admin" roles are simulated as it runs locally. The local JSON files (`data/causes.json`, `data/milestones.json`) act as the database.
- **What is Experimental:** The Gemini AI prompt for auditing invoices is experimental and relies on LLM heuristics.

# 2. Complete Tech Stack

| Category | Technology | Version | Actual Usage | Important Files | Why Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite) | ^19.2.0 | UI for Donors and Admins. | `frontend/src/App.jsx`, `frontend/src/pages/Admin.jsx` | Fast, modern component-based UI. |
| **Web3 (Client)** | Ethers.js | ^6.16.0 | Connecting MetaMask, calling contracts. | `frontend/src/wallet.js` | Standard library for Ethereum interaction. |
| **Backend** | Express (Node.js) | ^5.2.1 | API server, OCR runner, AI integration. | `backend/index.js`, `backend/invoiceFlow.js` | Lightweight server for handling file uploads and async blockchain txs. |
| **Blockchain** | Solidity / Hardhat | ^0.8.24 | Smart Contracts for escrow and registry. | `contracts/*.sol`, `hardhat.config.js` | Ethereum standard language and development environment. |
| **AI / LLM** | Google Gemini API | ^0.24.1 | Verifying OCR text against claimed amounts. | `backend/gemini.js` | Advanced LLM capable of understanding unstructured text and returning JSON. |
| **OCR** | Tesseract.js / pdf-parse | ^7.0.0 / ^1.1.1 | Extracting raw text from uploaded invoices. | `backend/ocr.js` | To convert image/PDF invoices into machine-readable text. |
| **Storage** | Pinata (IPFS) | ^2.1.0 | Decentralized storage for invoice bundles. | `backend/ipfs.js` | Immutable storage for receipts/proofs. |
| **Database** | Local JSON Files | N/A | Storing Causes, Milestones, and Invoices. | `backend/causeStore.js`, `backend/invoiceStore.js` | Quick prototyping without setting up a full database (e.g., MongoDB). |

# 3. Repository Structure

| File/Folder | Purpose | Important Logic |
| :--- | :--- | :--- |
| `contracts/` | Solidity Smart Contracts. | Contains `DonationRegistry.sol`, `Treasury.sol`, etc. |
| `backend/` | Express API Server. | `index.js` (Entry point), `invoiceFlow.js` (Core logic for AI and Blockchain). |
| `backend/data/` | Local JSON Database. | `causes.json`, `milestones.json`, `invoices.json` (State persistence). |
| `frontend/` | React Application. | `src/main.jsx` (Entry), `src/pages/` (UI Views). |
| `backend/ocr.js` | Text Extraction. | Uses `tesseract.js` for images and `pdf-parse` for PDFs. |
| `backend/gemini.js` | AI Verification. | Prompts Gemini to audit the extracted OCR text against the claim. |
| `backend/ipfs.js` | Pinata Integration. | Uploads encrypted bundles to IPFS. |

# 4. Architecture

User (Admin)
→ Frontend (React Upload Form)
→ API (Express `/invoice`)
→ OCR (Tesseract / pdf-parse)
→ AI Model (Google Gemini 1.5 Flash)
→ IPFS (Pinata)
→ Database (Local JSON)

(Later during Voting)
Admin
→ API (`/invoice/:id/vote`)
→ Business Logic (Quorum check)
→ Smart Contract (InvoiceVerifier & Treasury on Sepolia/Localhost)
→ Response

# 5. End-to-End Data Flow

**Workflow: Invoice Submission & Approval**
1. **User Action:** Admin uploads an invoice via the `/admin` dashboard.
2. **API:** Request hits `POST /invoice` in `backend/index.js`.
3. **Controller/Service:** `submitInvoice` in `backend/invoiceFlow.js` is called.
4. **OCR:** `runOCR()` in `backend/ocr.js` extracts text from the file.
5. **AI Analysis:** `verifyInvoiceWithGemini()` in `backend/gemini.js` evaluates the text against the claimed amount.
6. **Storage:** `uploadEncryptedBundle()` in `backend/ipfs.js` pins the data to IPFS.
7. **Database:** `createInvoice()` in `backend/invoiceStore.js` saves the invoice to `data/invoices.json` with status `PENDING`.
8. **Voting:** Another admin votes via `POST /invoice/:id/vote`.
9. **Blockchain:** Once quorum (2 votes) is reached, `adminVote` in `backend/invoiceFlow.js` calls `attestInvoice` on `InvoiceVerifier.sol` and `queuePayout` on `Treasury.sol`.

# 6. Feature-by-Feature Explanation

## Feature: AI Invoice Verification

### What it does
Automatically audits an uploaded invoice by extracting text and using an LLM to check if the document actually supports the amount the vendor is claiming.

### Why it exists
To prevent the "Oracle Problem" where admins could collude or make mistakes, paying out funds for fabricated claims. The AI acts as an impartial reviewer.

### How it works
Uploads file -> Extracts text (Tesseract/pdf-parse) -> Sends prompt to Gemini API with the extracted text and the requested payout amount -> Gemini returns a JSON containing a `decision` (APPROVE/REVIEW/REJECT) and a `credibility_score`.

### Files involved
`backend/ocr.js`, `backend/gemini.js`, `backend/invoiceFlow.js`

### Edge cases
- Poor quality images leading to bad OCR.
- Non-standard invoice formats that confuse the LLM.
- LLM hallucinations returning invalid JSON (partially mitigated by Regex matching in `gemini.js`).

### Error handling
Catches errors if Gemini fails or doesn't return JSON. The invoice is still created, but the AI result might reflect the error or require manual intervention.

# 7. Database Deep Dive

The project uses a **Local File System (JSON)** as a database, not a traditional SQL/NoSQL DB.

- **Tables/Collections:** `causes.json`, `milestones.json`, `invoices.json`
- **Fields (Invoices):** `id`, `vendor`, `amount`, `text`, `extracted`, `mlResult`, `fileCid`, `milestoneId`, `ipfs`, `votes`, `status`
- **Relationships:** Invoices reference a `milestoneId`. Milestones reference a `causeId`.
- **Normalization:** Very basic. `cause.milestoneIds` stores an array of integer IDs linking to the milestones file.
- **Concurrency concerns:** Since `fs.writeFileSync` is used synchronously without locks, multiple concurrent requests could cause race conditions and overwrite the JSON files (Data loss risk).

# 8. API Deep Dive

| Method | Endpoint | Request | Response | Auth | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/config` | None | `{ treasuryAddress, verifierAddress }` | None | Provide contract addresses to frontend. |
| `POST` | `/causes` | `{ title, budget }` | Cause Object | None | Create a new cause. |
| `POST` | `/milestones`| `{ causeId, description, allocation }` | Milestone Object | None | Create a milestone for a cause. |
| `POST` | `/invoice` | `multipart/form-data` (file, vendor, amount, milestoneId) | Invoice Object | None | Upload invoice, run OCR + AI. |
| `POST` | `/invoice/:id/vote`| `{ admin }` | Updated Invoice | None | Cast an admin vote for an invoice. |
| `POST` | `/payout/:id/execute`| `{ payoutId }` | `{ success, txHash }` | None | Manually trigger treasury execution. |
| `GET` | `/invoices` | None | List of Invoices | None | Fetch all invoices. |
| `GET` | `/admin/dashboard`| None | `{ causes: [...], orphans: [...] }` | None | Fetch aggregated dashboard data. |

# 9. Authentication & Authorization

- **Implementation:** **NOT IMPLEMENTED.** 
- The backend API has no real authentication middleware. 
- The `/invoice/:id/vote` endpoint accepts an `admin` string in the request body, which allows anyone who can call the API to spoof an admin vote.
- **Blockchain Auth:** The smart contracts (like `Treasury.sol`) use `onlyAdmin` modifiers, meaning only the private key loaded in the backend's `.env` (or the deployer) can queue/execute payouts.

# 10. AI/ML Deep Dive

- **Model:** Google Gemini 1.5 Flash (via `@google/generative-ai`).
- **Data Preprocessing:** Images are processed via Tesseract.js (Optical Character Recognition) to extract raw text. PDFs use `pdf-parse`.
- **Architecture/Flow:** The extracted unstructured text is injected into a strict prompt template in `backend/gemini.js`.
- **Evaluation / Inference:** Gemini is instructed to act as a financial auditor, looking for evidence of the `claimedAmount` in the `rawTextSnippet`.
- **Metrics / Output:** The prompt forces the LLM to output structured JSON with a `credibility_score` (0-100), a `decision` (APPROVE/REVIEW/REJECT), and an `explanation`.
- **Limitations:** Dependent on OCR quality. The LLM is acting as a heuristic pattern matcher, not doing actual deterministic math.

# 11. Blockchain Deep Dive

- **Network:** Ethereum (configured for Hardhat Localhost or Sepolia Testnet).
- **Contracts:**
  - `DonationRegistry.sol`: Maps donor commitments (hash of identity) to `causeId` and stores a `receiptCID` (IPFS). Emits events upon receiving ETH.
  - `Treasury.sol`: Holds the actual ETH funds. Has a `queuePayout` function (restricted to admin) and an `executePayout` function. Includes a `TIMELOCK` of 1 minute.
  - `InvoiceVerifier.sol`: Stores the AI attestations (`credibilityScore` and `aiDecisionHash`).
- **State & Transactions:** The backend holds the "Admin" private key in `.env`. When an invoice gets 2 votes, the backend submits transactions to `InvoiceVerifier` and `Treasury`.
- **On-chain / Off-chain:** Heavy lifting (OCR, AI, voting logic) is off-chain. Only the final payout queueing and attestation hashes are stored on-chain to save gas and protect privacy.
- **IPFS:** Receipts and AI metadata are bundled and pinned to Pinata, returning a CID that is referenced on-chain.

# 12. Hardware / IoT Deep Dive
NOT RELEVANT.

# 13. Algorithms & Data Structures

- **Quorum Consensus:** A simple array-length check algorithm `inv.votes.length >= QUORUM`. Time complexity O(1) assuming the array push is the only operation.
- **Relational Mapping in JSON:** Causes maintain an array of `milestoneIds`. In `backend/index.js` (`/admin/dashboard`), an aggregation algorithm loops through `causes`, maps `milestoneIds` to `milestones` objects, and filters `invoices` matching that milestone. Time complexity: O(C * M * I) where C=causes, M=milestones per cause, I=total invoices. Acceptable for prototype, bad for scale.

# 14. Design Decisions

## Why use an LLM (Gemini) instead of deterministic Regex?
Regex is brittle when dealing with OCR output from various invoice formats (different vendors use different layouts, "Total", "Amount Due", "Balance", etc.). An LLM can semantically understand the context and map it to the requested claim amount much more robustly.

## Why store data in JSON files instead of a Database?
For rapid prototyping and hackathon-style development. It completely eliminates the need to host and connect to a MongoDB/PostgreSQL instance.

## Why keep OCR and AI off-chain?
Smart contracts cannot perform intensive computation like OCR, nor can they make API calls to Gemini (the Oracle Problem). Therefore, a centralized (or decentralized oracle) backend must perform these tasks and attest the result on-chain.

# 15. Real Technical Challenges

- **Problem:** Gemini API sometimes returns text (like Markdown ````json`) wrapping the JSON response, breaking `JSON.parse()`.
- **Solution:** In `backend/gemini.js`, a Regex `rawText.match(/\{[\s\S]*\}/)` is used to explicitly extract only the JSON object from the LLM's raw text response.
- **Lesson:** Always sanitize and validate LLM outputs aggressively before using them in code logic.

# 16. Bugs / Risks

- **IMPLEMENTED PROBLEM (Race Condition):** `backend/invoiceStore.js` uses synchronous file writes (`fs.writeFileSync`) without locking. Concurrent API requests will overwrite data.
- **IMPLEMENTED PROBLEM (Timelock Bug):** In `backend/invoiceFlow.js`, `treasury.executePayout(payoutId)` is called *immediately* after `treasury.queuePayout`. However, `Treasury.sol` has a `TIMELOCK = 1 minutes`. The execution transaction will always revert with "Timelock active" if attempted immediately. The `try/catch` swallows this, meaning payouts are queued but never automatically executed.
- **POTENTIAL RISK (Security):** Missing API authentication. Anyone can hit `POST /invoice/:id/vote` with `{"admin": "fake_admin"}` and force a payout.
- **POTENTIAL RISK (Smart Contract):** `Treasury.sol` uses `vendor.transfer(p.amount)`. If the vendor is a smart contract that doesn't have a `receive()` function, the transaction will fail, locking the payout.

# 17. Performance

- **IMPLEMENTED OPTIMIZATIONS:** Using `tesseract.js` and `pdf-parse` locally prevents sending huge image files directly to the LLM (which saves tokens/latency), instead sending only the extracted text.
- **RECOMMENDED IMPROVEMENTS:** The JSON aggregation in `/admin/dashboard` is inefficient. A real database with joins (SQL) or document embedding (MongoDB) is needed for scale.

# 18. Security

- **Secrets:** Handled via `.env` files (Pinata API keys, Gemini API key, Wallet Private Key).
- **Authentication:** **Gaps exist.** Frontend relies on MetaMask, but Backend API endpoints are completely unprotected.
- **Validation:** Missing input validation on most API endpoints (e.g., amount is parsed with `Number()`, which can result in `NaN`).
- **Smart Contracts:** Simple logic, but `vendor.transfer` is generally discouraged in favor of `call{value: amount}("")` to prevent gas griefing.

# 19. Testing

- **Current State:** There are hardhat deployment scripts (`scripts/deploy_all.js`), but actual automated tests in the `test/` directory only contain an empty/default `Lock.js`.
- **Verdict:** unit tests and integration tests are missing.

# 20. Deployment

NOT CURRENTLY DEPLOYED.
(The README mentions Sepolia, but the configuration relies entirely on local `.env` setups and `localhost:3000` hardcoded in places).

**Suggested Deployment Plan:**
1. Frontend: Vercel or Netlify.
2. Backend: Render, Heroku, or AWS EC2 (Needs sufficient RAM for Tesseract OCR).
3. Smart Contracts: Deploy to Sepolia using Hardhat and verify on Etherscan.
4. Database: Migrate from local JSON to MongoDB Atlas.

# 21. Interview Questions

### Easy
- Explain the role of IPFS (Pinata) in this project. Why not just store the files in a database?
- What problem does Google Gemini solve in this architecture?

### Medium
- How does the communication between the React frontend, the Express backend, and the Ethereum Blockchain work in this project?
- I see you used Tesseract.js. What are the challenges of using OCR before sending data to an LLM?

### Hard
- Explain the "Oracle Problem" and how your project attempts to solve it using the `InvoiceVerifier` contract and the backend Node.js server.
- In `backend/invoiceFlow.js`, you queue a payout and then immediately try to execute it. How does the 1-minute `TIMELOCK` in `Treasury.sol` affect this workflow?

### Very Hard
- If I discover the URL of your backend, how could I steal funds from the `Treasury` contract? (Hint: look at the `/invoice/:id/vote` endpoint). How would you architect a secure solution to this?

# 22. Interview Answer Guidance

- **What problem does Gemini solve?**
  *Guidance:* The interviewer is testing if you understand heuristics vs determinism. Mention that OCR output is messy. Regex fails if the invoice format changes. Gemini understands context and finds the claimed amount regardless of formatting.
- **Oracle Problem:**
  *Guidance:* Explain that blockchains cannot make HTTP calls. To use real-world data (like a PDF invoice), an off-chain actor (your backend) must process it and push the result on-chain. Acknowledge that your backend is a centralized point of failure in this prototype.
- **Timelock / Execution Bug:**
  *Guidance:* Be honest. Acknowledge that the immediate `executePayout` will fail due to the contract's 1-minute timelock. Explain that the proper architecture would be a background cron job (or an event listener) that checks for queued payouts whose timelocks have expired, and executes them then.
- **Security Flaw:**
  *Guidance:* Admit that the Express API lacks JWT or session authentication. Explain that to fix this, you would require admins to sign a message with their MetaMask wallet, verify the signature in the backend (`ethers.verifyMessage`), and issue a JWT for subsequent API calls.

# 23. 30-Second Explanation
"I built a Web3 donation platform to solve transparency issues in NGOs. Donors deposit funds into a smart contract, but funds are only released to vendors when an invoice is provided. To automate this, my Node.js backend uses OCR to read the invoice, passes the text to Google Gemini AI to verify the amount, and if approved by admins, the backend interacts with the Ethereum smart contract to release the funds."

# 24. 2-Minute Explanation
"This project is a transparent NGO donation system. It consists of a React frontend, a Node/Express backend, and Solidity smart contracts. The main problem it solves is the 'Oracle Problem' in charity—how do we know the funds are actually being spent on what is claimed? 
When an NGO admin wants to pay a vendor, they upload an invoice to the backend. The backend uses Tesseract.js and pdf-parse to extract the text, and then prompts Gemini 1.5 Flash to act as a financial auditor to verify the claimed amount against the messy OCR text. 
If the AI gives a high credibility score, human admins vote on it. Once a quorum is reached, the backend takes the admin's private key, attests the AI's decision on an `InvoiceVerifier` smart contract, and queues a payout in the `Treasury` contract. All receipts are pinned to IPFS for immutable storage. It's a prototype demonstrating how AI can bridge the gap between off-chain physical documents and on-chain fund execution."

# 25. 5-Minute Technical Explanation
(Use the architecture flow. Start with the Smart Contract state, move to the Frontend User flow, then dive deep into the Backend pipeline: Route -> OCR -> AI Prompt Engineering -> IPFS -> Voting -> Smart Contract Execution. Acknowledge the local JSON database as a hackathon shortcut, and discuss the Timelock bug and how you would fix it using event listeners or cron jobs.)

# 26. Resume Claim Verification

| Resume Claim | Verified? | Evidence | Risk |
| :--- | :--- | :--- | :--- |
| Built a full-stack Web3 application with React and Node.js | ✅ Verified | Frontend and Backend folders exist and function. | None |
| Integrated Google Gemini AI for automated invoice auditing | ✅ Verified | `backend/gemini.js` handles prompt and parsing. | None |
| Implemented OCR for extracting text from PDFs and images | ✅ Verified | `backend/ocr.js` uses Tesseract and pdf-parse. | None |
| Created Solidity smart contracts for milestone-based escrows | ✅ Verified | `Treasury.sol` and `CauseManager.sol` exist. | None |
| Deployed highly secure multi-sig smart contracts | ❌ Not verified | The contracts are simple, and backend APIs lack basic Auth. | High (Do not claim it is "highly secure") |

# 27. Truthfulness Audit

- **Confidently Claim:** Integration of AI/LLMs for unstructured data parsing, Web3 contract interaction via Ethers.js, basic full-stack React/Node architecture, IPFS integration.
- **Explain More Carefully:** The Multi-sig governance. (It's currently handled off-chain in the Express API, not as an on-chain Gnosis Safe).
- **Do Not Claim:** High security, production readiness, high scalability.
- **Needs Confirmation:** Whether the project was ever deployed to Sepolia, or just run locally on Hardhat.

# 28. What This Project Demonstrates
- Integrating multiple external APIs (Gemini, Pinata).
- Handling file uploads in Express (`multer`).
- Prompt Engineering (forcing an LLM to return strict JSON).
- Interacting with Ethereum smart contracts from a Node.js backend.
- Designing a domain-specific architecture (Escrow + Auditing).

# 29. What This Project Does NOT Demonstrate
- Database management (No SQL/NoSQL, just JSON files).
- User Authentication (No JWTs, OAuth, or Web3 Signatures).
- Secure API design (endpoints are open).
- Automated Testing (No unit tests).

# 30. Recommended Improvements

### Critical
- **Fix the Timelock Bug:** Remove the immediate `executePayout` call in `invoiceFlow.js`. Create a separate endpoint or cron job that checks for expired timelocks and executes them.
- **API Security:** Add simple API key middleware or Web3 signature verification so random users can't trigger votes.

### High Value
- **Migrate Database:** Replace `fs.writeFileSync` with a free MongoDB Atlas cluster using Mongoose.
- **Error Handling:** Add proper `try/catch` blocks in Express routes and return standard HTTP error codes.

### Nice to Have
- Add a script to automatically deploy and verify contracts on Sepolia.
- Write basic tests for the AI verification logic.

### Avoid
- Adding complex tokenomics or governance tokens. Keep the focus on the core value proposition: Transparent, AI-audited fiat/stablecoin payouts.
