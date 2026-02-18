import React, { useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x4A5B33c5aFe427a15A13F35B89747d7669aE54eD";

const abi = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function borrow(uint256 amount)",
  "function repay(uint256 amount)",
  "function collateralETH(address) view returns (uint256)",
  "function debtUSD(address) view returns (uint256)"
];

function App() {

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const [collateral, setCollateral] = useState("0");

  const [debt, setDebt] = useState("0");

  const [amount, setAmount] = useState("");

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

    const deb = await lending.debtUSD(address);

    setCollateral(ethers.formatEther(col));

    setDebt(ethers.formatEther(deb));

  }

  async function deposit() {

    const tx = await contract.deposit({

      value: ethers.parseEther(amount)

    });

    await tx.wait();

    alert("Deposit success");

    loadData(contract, account);

  }

  async function withdraw() {

    const tx = await contract.withdraw(

      ethers.parseEther(amount)

    );

    await tx.wait();

    alert("Withdraw success");

    loadData(contract, account);

  }

  async function borrow() {

    const tx = await contract.borrow(

      ethers.parseEther(amount)

    );

    await tx.wait();

    alert("Borrow success");

    loadData(contract, account);

  }

  async function repay() {

    const tx = await contract.repay(

      ethers.parseEther(amount)

    );

    await tx.wait();

    alert("Repay success");

    loadData(contract, account);

  }

  return (

    <div style={{ padding: "20px" }}>

      <h2>🚀 My DeFi Lending App</h2>

      <button onClick={connectWallet}>

        Connect Wallet

      </button>

      <p>Account: {account}</p>

      <hr />

      <h3>Your Position</h3>

      <p>Collateral: {collateral} ETH</p>

      <p>Debt: {debt} ETH</p>

      <hr />

      <input

        placeholder="Enter amount"

        onChange={(e) => setAmount(e.target.value)}

      />

      <br /><br />

      <button onClick={deposit}>Deposit</button>

      <button onClick={withdraw}>Withdraw</button>

      <button onClick={borrow}>Borrow</button>

      <button onClick={repay}>Repay</button>

    </div>

  );

}

export default App;
