import React, { useState } from "react";
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

  const [amount, setAmount] = useState("");

  const [collateral, setCollateral] = useState("0");

  const [debt, setDebt] = useState("0");

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

    setDebt(deb.toString());

  }

  async function deposit() {

    const tx = await contract.deposit({

      value: ethers.parseEther(amount)

    });

    await tx.wait();

    alert("Deposit success");

  }

  async function withdraw() {

    const tx = await contract.withdraw(

      ethers.parseEther(amount)

    );

    await tx.wait();

    alert("Withdraw success");

  }

  async function borrow() {

    const tx = await contract.borrow(amount);

    await tx.wait();

    alert("Borrow success");

  }

  async function repay() {

    const tx = await contract.repay(amount);

    await tx.wait();

    alert("Repay success");

  }

  return (

    <div style={{ padding: "20px" }}>

      <h2>My DeFi Lending App</h2>

      <button onClick={connectWallet}>

        Connect Wallet

      </button>

      <p>{account}</p>

      <p>Collateral: {collateral} ETH</p>

      <p>Debt: {debt} USD</p>

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
