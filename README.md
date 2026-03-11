# DeFi Lending Frontend

A frontend interface for interacting with a **DeFi Lending Protocol** built using **React.js and Ethers.js**.
This application allows users to connect their wallet and interact with smart contracts deployed on the Ethereum blockchain.

The frontend communicates with the lending smart contracts to enable users to:

* Deposit liquidity into the lending pool
* Borrow tokens using collateral
* Withdraw supplied assets
* Repay borrowed loans
* Monitor the **health factor** of their position
* Retrieve asset prices using **Chainlink price feeds**

This interface provides a simple UI for interacting with decentralized lending protocols similar to those used in modern DeFi platforms.

---

## Features

* Connect wallet using MetaMask
* Deposit tokens into the lending pool
* Borrow tokens against collateral
* Withdraw deposited assets
* Repay borrowed loans
* Health factor monitoring for risk management
* Integration with **Chainlink price feeds** for accurate asset pricing
* Smart contract interaction using **Ethers.js**

---

## Tech Stack

**Frontend**

* React.js
* JavaScript
* HTML / CSS

**Blockchain Interaction**

* Ethers.js

**Oracles**

* Chainlink Price Feeds

**Smart Contracts**

* Solidity
* Hardhat
* OpenZeppelin


---

## Project Structure

```id="n6cr1b"
lending-frontend
│
├── public
├── src
│   ├── components
│   ├── utils
│   └── App.js
│
├── .env
├── package.json
├── vercel.json
└── README.md
```

---

## Installation

Clone the repository

```id="m8h9np"
git clone https://github.com/ranavipul08-spec/Lending-Frontend.git
cd Lending-Frontend
```

Install dependencies

```id="y61k3s"
npm install
```

---

## Run Locally

Start the development server

```id="3bf49e"
npm start
```

The application will run at:

```
http://localhost:3000
```

---

## Smart Contract Integration

The frontend interacts with the deployed lending contracts using **Ethers.js**.

Contract addresses are configured in the `.env` file.

Example:

```
REACT_APP_CONTRACT_ADDRESS=0x...
```

---

## Deployment

This project can be deployed using **Vercel**.

```id="moa5rq"
npm run build
```

Then deploy using the Vercel CLI or GitHub integration.

---

## Learning Goals

This project demonstrates:

* Web3 frontend development
* Smart contract interaction with Ethers.js
* Wallet connection and transaction handling
* DeFi protocol UI integration
* Full-stack blockchain development



---

## License

MIT
