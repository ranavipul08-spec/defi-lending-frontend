import React, { useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x4A5B33c5aFe427a15A13F35B89747d7669aE54eD";

const abi = [
  "function deposit() payable",
  "function withdraw(uint256 amount)"
];

function App() {

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  async function connectWallet() {

    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const lending = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    setAccount(await signer.getAddress());

    setContract(lending);
  }

  async function deposit() {

    if (!contract) return;

    const tx = await contract.deposit({

      value: ethers.parseEther("0.01")

    });

    await tx.wait();

    alert("Deposit Success");

  }

  async function withdraw() {

    if (!contract) return;

    const tx = await contract.withdraw(

      ethers.parseEther("0.01")

    );

    await tx.wait();

    alert("Withdraw Success");

  }

  return (

    <div style={{ padding: "20px" }}>

      <h2>DeFi Lending App</h2>

      <button onClick={connectWallet}>

        Connect Wallet

      </button>

      <p>{account}</p>

      <button onClick={deposit}>

        Deposit 0.01 ETH

      </button>

      <br /><br />

      <button onClick={withdraw}>

        Withdraw 0.01 ETH

      </button>

    </div>

  );

}

export default App;
