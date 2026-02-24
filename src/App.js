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
  const [provider, setProvider] = useState(null);
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

  // Load data whenever contract or account changes
  useEffect(() => {
    if (contract && account) {
      console.log("useEffect triggered - loading data...");
      loadData(contract, account);
      // Refresh data every 10 seconds
      const interval = setInterval(() => loadData(contract, account), 10000);
      return () => clearInterval(interval);
    }
  }, [contract, account]);

  const connectWallet = async () => {
    try {
      setError("");
      setLoading(true);

      if (typeof window === 'undefined' || !window.ethereum) {
        setError("MetaMask is not installed. Please install MetaMask to continue.");
        setLoading(false);
        return;
      }

      const prov = new ethers.BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();
      const address = await signer.getAddress();

      const network = await prov.getNetwork();

	const chainId = Number(network.chainId);

	console.log("Connected chain:", chainId);

	if (chainId !== 11155111) {

 	setError(
 	 `Wrong network! You are on chain ${chainId}. Please switch to Sepolia 	(11155111).`
 	);

	 setLoading(false);
 	return;
	}

      const lending = new ethers.Contract(contractAddress, abi, signer);

      setProvider(prov);
      setAccount(address);
      setContract(lending);
      setError("");
      
      console.log("Wallet connected successfully:", address);

    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (contractInstance, address) => {
    try {
      console.log("🔄 Loading data for address:", address);
      console.log("📍 Contract address:", contractAddress);

      const col = await contractInstance.collateralETH(address);
      console.log("✅ Collateral (raw):", col.toString());

      const debtValue = await contractInstance.debtUSD(address);
      console.log("✅ Debt (raw):", debtValue.toString());

      const price = await contractInstance.getETHPrice();
      console.log("✅ ETH Price (raw):", price.toString());

      const health = await contractInstance.getHealthFactor(address);
      console.log("✅ Health Factor (raw):", health.toString());

      const ethPriceNum = Number(price) / 1e8;
      const collateralEth = Number(ethers.formatEther(col));
      const colUSD = collateralEth * ethPriceNum;

      setCollateral(collateralEth.toFixed(4));
      setDebt(debtValue.toString());
      setEthPrice(ethPriceNum.toFixed(2));
      setCollateralUSD(colUSD.toFixed(2));

      if (health > 1e30) {
        setHealthFactor("SAFE");
      } else {
        setHealthFactor(Number(health).toFixed(2));
      }

      const max = (colUSD * 100) / 150;
      setMaxBorrow(max.toFixed(2));

      console.log("✅ Data loaded successfully!");
      setError("");
    } catch (err) {
      console.error("❌ Data loading error:", err);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      setError(`Failed to load data: ${err.message}`);
    }
  };

  const deposit = async () => {
    try {
      if (!contract) {
        setError("Please connect wallet first");
        return;
      }
      setLoading(true);
      const tx = await contract.deposit({ value: ethers.parseEther("0.01") });
      console.log("Deposit tx:", tx.hash);
      await tx.wait();
      alert("✅ Deposit successful");
      await loadData(contract, account);
    } catch (err) {
      console.error("Deposit error:", err);
      setError(`Deposit failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    try {
      if (!contract) {
        setError("Please connect wallet first");
        return;
      }
      if (!withdrawAmount) {
        setError("Please enter an amount");
        return;
      }
      setLoading(true);
      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      console.log("Withdraw tx:", tx.hash);
      await tx.wait();
      alert("✅ Withdraw successful");
      await loadData(contract, account);
      setWithdrawAmount("");
    } catch (err) {
      console.error("Withdraw error:", err);
      setError(`Withdraw failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const borrow = async () => {
    try {
      if (!contract) {
        setError("Please connect wallet first");
        return;
      }
      if (!borrowAmount) {
        setError("Please enter an amount");
        return;
      }
      setLoading(true);
      const tx = await contract.borrow(borrowAmount);
      console.log("Borrow tx:", tx.hash);
      await tx.wait();
      alert("✅ Borrow successful");
      await loadData(contract, account);
      setBorrowAmount("");
    } catch (err) {
      console.error("Borrow error:", err);
      setError(`Borrow failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const repay = async () => {
    try {
      if (!contract) {
        setError("Please connect wallet first");
        return;
      }
      if (!repayAmount) {
        setError("Please enter an amount");
        return;
      }
      setLoading(true);
      const tx = await contract.repay(repayAmount);
      console.log("Repay tx:", tx.hash);
      await tx.wait();
      alert("✅ Repay successful");
      await loadData(contract, account);
      setRepayAmount("");
    } catch (err) {
      console.error("Repay error:", err);
      setError(`Repay failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>💰 DeFi Lending App</h2>

      {error && (
        <div style={{ 
          color: "red", 
          padding: "10px", 
          border: "1px solid red", 
          marginBottom: "10px", 
          borderRadius: "4px",
          backgroundColor: "#ffe6e6"
        }}>
          ⚠️ {error}
        </div>
      )}

      <button 
        onClick={connectWallet} 
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : account ? "#28a745" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Connecting..." : account ? "✅ Connected" : "🔗 Connect Wallet"}
      </button>

      <p>
        <strong>Account:</strong> {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
      </p>

      <hr />

      <h3>📊 Your Position</h3>
      <p><strong>Collateral:</strong> {collateral} ETH (${collateralUSD})</p>
      <p><strong>Debt:</strong> {debt} USD</p>
      <p><strong>Health Factor:</strong> {healthFactor}</p>
      <p><strong>Max Borrow:</strong> ${maxBorrow}</p>

      {healthFactor !== "SAFE" && healthFactor !== "0" && Number(healthFactor) < 150 && (
        <p style={{ color: "red", fontWeight: "bold" }}>🔴 ⚠️ Liquidation Risk</p>
      )}

      <hr />

      <h3>💳 Deposit 0.01 ETH</h3>
      <button 
        onClick={deposit} 
        disabled={loading || !account}
        style={{
          padding: "10px 20px",
          backgroundColor: loading || !account ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !account ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Processing..." : "Deposit"}
      </button>

      <hr />

      <h3>💸 Withdraw</h3>
      <input
        placeholder="ETH amount"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        disabled={loading || !account}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />
      <button 
        onClick={withdraw} 
        disabled={loading || !account}
        style={{
          padding: "8px 15px",
          backgroundColor: loading || !account ? "#ccc" : "#ffc107",
          color: "black",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !account ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>

      <hr />

      <h3>📈 Borrow</h3>
      <input
        placeholder="USD amount"
        value={borrowAmount}
        onChange={(e) => setBorrowAmount(e.target.value)}
        disabled={loading || !account}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />
      <button 
        onClick={borrow} 
        disabled={loading || !account}
        style={{
          padding: "8px 15px",
          backgroundColor: loading || !account ? "#ccc" : "#17a2b8",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !account ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Processing..." : "Borrow"}
      </button>

      <hr />

      <h3>💰 Repay</h3>
      <input
        placeholder="USD amount"
        value={repayAmount}
        onChange={(e) => setRepayAmount(e.target.value)}
        disabled={loading || !account}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />
      <button 
        onClick={repay} 
        disabled={loading || !account}
        style={{
          padding: "8px 15px",
          backgroundColor: loading || !account ? "#ccc" : "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !account ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Processing..." : "Repay"}
      </button>

      <hr />

      <h3>📍 Protocol Data</h3>
      <p><strong>ETH Price:</strong> ${ethPrice}</p>
      <p><strong>Collateral Value:</strong> ${collateralUSD}</p>
      <p><strong>Max Borrow:</strong> ${maxBorrow}</p>
      <p>
        <strong>Status:</strong>{" "}
        {healthFactor !== "SAFE" && healthFactor !== "0" && Number(healthFactor) < 150
          ? "🔴 LIQUIDATION RISK"
          : "🟢 SAFE"}
      </p>
    </div>
  );
}

export default App;