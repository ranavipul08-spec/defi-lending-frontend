import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0x4A5B33c5aFe427a15A13F35B89747d7669aE54eD";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [collateral, setCollateral] = useState("0");
  const [debt, setDebt] = useState("0");
  const [ethPrice, setEthPrice] = useState("0");
  const [collateralUSD, setCollateralUSD] = useState("0");
  const [healthFactor, setHealthFactor] = useState("0");
  const [maxBorrow, setMaxBorrow] = useState("0");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  useEffect(() => {
    if (contract && account) {
      loadData();
    }
  }, [contract, account]);



  // CONNECT WALLET
  const connectWallet = async () => {

    try {

      if (!window.ethereum) {
        setError("Install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const address = await signer.getAddress();

      const network = await provider.getNetwork();

      if (Number(network.chainId) !== 11155111) {
        setError("Switch to Sepolia Network");
        return;
      }

      const lendingContract =
        new ethers.Contract(contractAddress, abi, signer);

      setAccount(address);

      setContract(lendingContract);

      setError("");

    }

    catch (err) {

      setError(err.message);

    }

  };



  // LOAD DATA
  const loadData = async () => {

    try {

      const col =
        await contract.collateralETH(account);

      const debtValue =
        await contract.debtUSD(account);

      const price =
        await contract.getETHPrice();

      const health =
        await contract.getHealthFactor(account);


      const ethPriceNum =
        Number(price) / 1e8;

      const collateralEth =
        Number(ethers.formatEther(col));

      const colUSD =
        collateralEth * ethPriceNum;


      setCollateral(collateralEth.toFixed(4));

      setDebt(debtValue.toString());

      setEthPrice(ethPriceNum.toFixed(2));

      setCollateralUSD(colUSD.toFixed(2));


      if (health > 1e30)
        setHealthFactor("SAFE");

      else
        setHealthFactor(Number(health).toFixed(2));


      const max =
        (colUSD * 100) / 150;

      setMaxBorrow(max.toFixed(2));

    }

    catch (err) {

      setError(err.message);

    }

  };



  // DEPOSIT
  const deposit = async () => {

    try {

      setLoading(true);

      const tx =
        await contract.deposit({
          value: ethers.parseEther("0.01")
        });

      await tx.wait();

      loadData();

    }

    catch (err) {

      setError(err.message);

    }

    setLoading(false);

  };



  // WITHDRAW
  const withdraw = async () => {

    try {

      const tx =
        await contract.withdraw(
          ethers.parseEther(withdrawAmount)
        );

      await tx.wait();

      loadData();

      setWithdrawAmount("");

    }

    catch (err) {

      setError(err.message);

    }

  };



  // BORROW
  const borrow = async () => {

    try {

      const tx =
        await contract.borrow(borrowAmount);

      await tx.wait();

      loadData();

      setBorrowAmount("");

    }

    catch (err) {

      setError(err.message);

    }

  };



  // REPAY
  const repay = async () => {

    try {

      const tx =
        await contract.repay(repayAmount);

      await tx.wait();

      loadData();

      setRepayAmount("");

    }

    catch (err) {

      setError(err.message);

    }

  };



  return (

    <div style={{ padding: 20 }}>

      <h2>DeFi Lending App</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={connectWallet}>
        Connect Wallet
      </button>

      <p>Account: {account}</p>

      <hr />



      <h3>Your Position</h3>

      <p>Collateral: {collateral} ETH (${collateralUSD})</p>

      <p>Debt: {debt} USD</p>

      <p>Health: {healthFactor}</p>

      <p>Max Borrow: ${maxBorrow}</p>



      <hr />



      <button onClick={deposit}>
        Deposit 0.01 ETH
      </button>



      <hr />



      <h3>Withdraw</h3>

      <input
        placeholder="ETH amount"
        value={withdrawAmount}
        onChange={(e) =>
          setWithdrawAmount(e.target.value)}
      />

      <button onClick={withdraw}>
        Withdraw
      </button>



      <hr />



      <h3>Borrow</h3>

      <input
        placeholder="USD amount"
        value={borrowAmount}
        onChange={(e) =>
          setBorrowAmount(e.target.value)}
      />

      <button onClick={borrow}>
        Borrow
      </button>



      <hr />



      <h3>Repay</h3>

      <input
        placeholder="USD amount"
        value={repayAmount}
        onChange={(e) =>
          setRepayAmount(e.target.value)}
      />

      <button onClick={repay}>
        Repay
      </button>



      <hr />



      <h3>Protocol Data</h3>

      <p>ETH Price: ${ethPrice}</p>

      <p>Status:
        {healthFactor === "SAFE"
          ? " SAFE"
          : " Risk"}
      </p>


    </div>

  );

}

export default App;