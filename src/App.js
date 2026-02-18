import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0x4A5B33c5aFe427a15A13F35B89747d7669aE54eD";

const abi = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function borrow(uint256 amountUSD)",
  "function repay(uint256 amountUSD)",
  "function collateralETH(address) view returns (uint256)",
  "function debtUSD(address) view returns (uint256)"
];

function App() {

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const [collateral, setCollateral] = useState("0");
  const [debt, setDebt] = useState("0");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  async function connectWallet() {

    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const lending = new ethers.Contract(contractAddress, abi, signer);

    const address = await signer.getAddress();

    setAccount(address);

    setContract(lending);

    loadData(lending, address);
  }

  async function loadData(lending, address) {

    const col = await lending.collateralETH(address);

    const debt = await lending.debtUSD(address);

    setCollateral(ethers.formatEther(col));

    setDebt(debt.toString());
  }

  async function deposit() {

    const tx = await contract.deposit({

      value: ethers.parseEther("0.01")

    });

    await tx.wait();

    alert("Deposit successful");

    loadData(contract, account);
  }

  async function withdraw() {

    const tx = await contract.withdraw(

      ethers.parseEther(withdrawAmount)

    );

    await tx.wait();

    alert("Withdraw successful");

    loadData(contract, account);
  }

  async function borrow() {

    const tx = await contract.borrow(borrowAmount);

    await tx.wait();

    alert("Borrow successful");

    loadData(contract, account);
  }

  async function repay() {

    const tx = await contract.repay(repayAmount);

    await tx.wait();

    alert("Repay successful");

    loadData(contract, account);
  }

  return (

    <div style={{ padding: "20px" }}>

      <h2>My DeFi Lending App</h2>

      <button onClick={connectWallet}>
        Connect Wallet
      </button>

      <p>Account: {account}</p>

      <hr />

      <h3>Your Position</h3>

      <p>Collateral: {collateral} ETH</p>

      <p>Debt: {debt} USD</p>

      <hr />

      <button onClick={deposit}>
        Deposit 0.01 ETH
      </button>

      <hr />

      <h3>Withdraw</h3>

      <input
        placeholder="ETH amount"
        onChange={(e) => setWithdrawAmount(e.target.value)}
      />

      <button onClick={withdraw}>
        Withdraw
      </button>

      <hr />

      <h3>Borrow</h3>

      <input
        placeholder="USD amount"
        onChange={(e) => setBorrowAmount(e.target.value)}
      />

      <button onClick={borrow}>
        Borrow
      </button>

      <hr />

      <h3>Repay</h3>

      <input
        placeholder="USD amount"
        onChange={(e) => setRepayAmount(e.target.value)}
      />

      <button onClick={repay}>
        Repay
      </button>

    </div>
  );
}

export default App;
