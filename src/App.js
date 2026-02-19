import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0xBc935Be53A6125Eee44C882840d1036a7E0bEeC2";

const abi = [

"function deposit() payable",

"function withdraw(uint256 amount)",

"function borrow(uint256 amountUSD)",

"function repay(uint256 amount)",

"function collateralETH(address) view returns (uint256)",

"function debtUSD(address) view returns (uint256)",

"function getHealthFactor(address) view returns (uint256)",

"function getETHPrice() view returns (uint256)"

];


function App() {

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // existing
  const [collateral, setCollateral] = useState("0");
  const [debt, setDebt] = useState("0");
   
  // NEW
  const [ethPrice, setEthPrice] = useState("0");
  const [collateralUSD, setCollateralUSD] = useState("0");
  const [healthFactor, setHealthFactor] = useState("0");
  const [maxBorrow, setMaxBorrow] = useState("0");

  // inputs
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");


  useEffect(() => {

    if (contract && account) {

    loadData(contract, account);

  }

   }, [contract, account]);

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

  const debtValue = await lending.debtUSD(address);

  const price = await lending.getETHPrice();

  const health = await lending.getHealthFactor(address);

  const ethPrice = Number(price) / 1e8;

  const collateralEth = Number(ethers.formatEther(col));

  const colUSD = collateralEth * ethPrice;

  setCollateral(collateralEth.toFixed(4));

  setDebt(debtValue.toString());

  setEthPrice(ethPrice.toFixed(2));

  setCollateralUSD(colUSD.toFixed(2));

  if (health > 1e30) {

  setHealthFactor("SAFE");

  } else {

  setHealthFactor(Number(health).toFixed(2));

  }

  const max = (colUSD * 100) / 150;

  setMaxBorrow(max.toFixed(2));

  }




  async function deposit() {
	
     if (!contract) {

     alert("Connect wallet first");

    return;

  }

    const tx = await contract.deposit({

      value: ethers.parseEther("0.01")

    });

    await tx.wait();

    alert("Deposit successful");

    loadData(contract, account);
  }

  async function withdraw() {

      if (!contract) {

     alert("Connect wallet first");

    return;

  }

    const tx = await contract.withdraw(

      ethers.parseEther(withdrawAmount)

    );

    await tx.wait();

    alert("Withdraw successful");

    loadData(contract, account);
  }

  async function borrow() {

    if (!contract) {

    alert("Connect wallet first");

    return;

  }

    const tx = await contract.borrow(borrowAmount);

    await tx.wait();

    alert("Borrow successful");

    loadData(contract, account);
  }

  async function repay() {

     if (!contract) {

     alert("Connect wallet first");

    return;

  }

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

      <p>Health Factor: {healthFactor}</p>

      <p>Max Borrow: {maxBorrow} USD</p>

      {healthFactor < 150 && (

      <p style={{color:"red"}}>

     ⚠️ Liquidation Risk

      </p>

      )}

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
	
	<h3>Your Position</h3>

	<p>Collateral: {collateral} ETH</p>

	<p>Debt: {debt} USD</p>

	<hr />

	<h3>Protocol Data</h3>

	<p>ETH Price: ${ethPrice}</p>

	<p>Collateral Value: ${collateralUSD}</p>

	<p>Max Borrow: ${maxBorrow}</p>

	<p>Health Factor: {healthFactor}</p>

	<p>

	Status:

	{

	Number(healthFactor) < 150

	? "🔴 LIQUIDATION RISK"

	: "🟢 SAFE"

	}

	</p>


    </div>
  );

}

export default App;
