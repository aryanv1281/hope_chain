let web3;
let contract;
let accounts;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    const abi = await (await fetch("FundraiserABI.json")).json();
    const contractAddress = "0xDccefF421f97450Ea9Afcf7BBcB5da6051957877";

    contract = new web3.eth.Contract(abi, contractAddress);
  } else {
    alert("Please install MetaMask!");
  }
});

document.getElementById("connectButton").onclick = async () => {
  if (window.ethereum) {
    try {
      // Check if already connected
      const currentAccounts = await window.ethereum.request({ method: "eth_accounts" });

      if (currentAccounts.length > 0) {
        accounts = currentAccounts;
        alert("Already connected: " + accounts[0]);
      } else {
        // Only request if not connected yet
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        alert("Connected: " + accounts[0]);
      }

    } catch (error) {
      if (error.code === -32002) {
        alert("MetaMask connection request is already pending. Please open your MetaMask extension and approve it.");
      } else {
        console.error("Connection failed:", error);
        alert("Failed to connect to MetaMask.");
      }
    }
  } else {
    alert("Please install MetaMask!");
  }
};

document.getElementById("createButton").onclick = async () => {
  if (!accounts || accounts.length === 0) {
    alert("Please connect to MetaMask first.");
    return;
  }

  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const goalEther = document.getElementById("goal").value;

  if (!name || !description || !goalEther) {
    alert("Please fill out all fields.");
    return;
  }

  const goal = web3.utils.toWei(goalEther, "ether");

  try {
    await contract.methods.createFundraiser(name, description, goal)
      .send({ from: accounts[0] });

    alert("Fundraiser created successfully!");
  } catch (error) {
    console.error("Transaction failed:", error);
    alert("Failed to create fundraiser. See console for details.");
  }
};
