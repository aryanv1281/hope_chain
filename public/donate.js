let web3;
let contract;
let userAccount;

const contractAddress = '0xDccefF421f97450Ea9Afcf7BBcB5da6051957877';
const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_goal",
				"type": "uint256"
			}
		],
		"name": "createFundraiser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			}
		],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "serial",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DonationReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "serial",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "FundraiserCreated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "fundraiserCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "fundraisers",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "goal",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountRaised",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "serial",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllFundraisers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "goal",
						"type": "uint256"
					},
					{
						"internalType": "address payable",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amountRaised",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "serial",
						"type": "uint256"
					}
				],
				"internalType": "struct Fundraiser.FundraiserData[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_serial",
				"type": "uint256"
			}
		],
		"name": "getFundraiser",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // replace with actual ABI

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    document.getElementById("wallet-address").textContent = `Connected: ${userAccount}`;
    initContract();
    loadFundraisers();
  } else {
    alert("Please install MetaMask!");
  }
}

function initContract() {
  contract = new web3.eth.Contract(abi, contractAddress);
}

async function loadFundraisers() {
  const response = await fetch("http://localhost:5000/fundraisers");
  const fundraisers = await response.json();
  console.log("Fundraisers response:", fundraisers);
  const container = document.getElementById("fundraisers");
  container.innerHTML = ""; // clear old content

  fundraisers.forEach(f => {
	const { name, description, goal, owner, amountRaised, serial } = f;
  
	const div = document.createElement("div");
	div.className = "fundraiser-card";
	div.innerHTML = `
	  <h3>${name}</h3>
	  <p>${description}</p>
	  <p>Goal: ${web3.utils.fromWei(goal, 'ether')} ETH</p>
	  <p>Raised: ${web3.utils.fromWei(amountRaised, 'ether')} ETH</p>
	  <button onclick="donate(${serial})">Donate</button>
	`;
  
	container.appendChild(div);
  });
  
}

async function donate(serial) {
  const amount = prompt("Enter donation amount (in ETH):");
  if (!amount) return;

  try {
    await contract.methods.donate(serial).send({
      from: userAccount,
      value: web3.utils.toWei(amount, "ether")
    });
    alert("Donation successful!");
    loadFundraisers();
  } catch (err) {
    console.error(err);
    alert("Transaction failed!");
  }
}

document.getElementById("connectButton").addEventListener("click", connectWallet);
