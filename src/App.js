import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "0xBc935Be53A6125Eee44C882840d1036a7E0bEeC2";

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
      loadData(contract, account);
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

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      console.log("Network chainId:", network.chainId);

	// Convert to number to avoid type mismatch
	const currentChainId = Number(network.chainId);
	console.log("Current chain ID (number):", currentChainId);

	if (currentChainId !== 11155111) {
  	setError(`Wrong network! You are on chain ${currentChainId}. Please switch to 	Sepolia (11155111).`);
  	setLoading(false);
  	return;
  	}
      const lending = new ethers.Contract(contractAddress, abi, signer);

      setAccount(address);
      setContract(lending);
      await loadData(lending, address);
      setError("");

    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (lending, address) => {
    try {
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
    } catch (err) {
      console.error("Data loading error:", err);
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
      await tx.wait();
      alert("✅ Deposit successful");
      loadData(contract, account);
    } catch (err) {
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
      await tx.wait();
      alert("✅ Withdraw successful");
      loadData(contract, account);
      setWithdrawAmount("");
    } catch (err) {
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
      await tx.wait();
      alert("✅ Borrow successful");
      loadData(contract, account);
      setBorrowAmount("");
    } catch (err) {
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
      await tx.wait();
      alert("✅ Repay successful");
      loadData(contract, account);
      setRepayAmount("");
    } catch (err) {
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
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Connecting..." : "🔗 Connect Wallet"}
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
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
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
        disabled={loading}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />
      <button 
        onClick={withdraw} 
        disabled={loading}
        style={{
          padding: "8px 15px",
          backgroundColor: loading ? "#ccc" : "#ffc107",
          color: "black",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
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
        disabled={loading}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />
      <button 
        onClick={borrow} 
        disabled={loading}
        style={{
          padding: "8px 15px",
          backgroundColor: loading ? "#ccc" : "#17a2b8",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
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
        disabled={loading}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />
      <button 
        onClick={repay} 
        disabled={loading}
        style={{
          padding: "8px 15px",
          backgroundColor: loading ? "#ccc" : "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
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