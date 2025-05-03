let web3;
let contract;
let userAccount;

const contractAddress = '0xff56A0B61E3Eb8ec0e35923bEa093De3e268cA9C';

// Manually fill in the ABI here
let abi =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
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
				"name": "id",
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
				"internalType": "string",
				"name": "_fundraiserType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_category",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_peopleAffected",
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
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
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
				"internalType": "string",
				"name": "fundraiserType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "peopleAffected",
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
						"internalType": "string",
						"name": "fundraiserType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "peopleAffected",
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
				"name": "_id",
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
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

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

async function donate(serial) {
  const amount = prompt("Enter donation amount (in ETH):");
  if (!amount) return;

  try {
    await contract.methods.donate(serial).send({
      from: userAccount,
      value: web3.utils.toWei(amount, "ether"),
    });
    alert("✅ Donation successful!");
    loadFundraisers();
  } catch (err) {
    console.error(err);
    alert("❌ Donation failed.");
  }
}

async function loadFundraisers() {
    const response = await fetch("http://localhost:5000/fundraisers");
    const fundraisers = await response.json();
    console.log(fundraisers); // Debugging line

    const publicContainer = document.getElementById("publicFundraisers");
    const privateContainer = document.getElementById("privateFundraisers");

    publicContainer.innerHTML = ""; // Clear the public container
    privateContainer.innerHTML = ""; // Clear the private container

    // Separate public and private fundraisers based on name
    const publicFundraisers = fundraisers.filter(f => f.name.includes('Public'));
    const privateFundraisers = fundraisers.filter(f => f.name.includes('Private'));

    // Render public fundraisers
    publicFundraisers.forEach(f => {
        const { name, description, goal, raised, serial } = f;
        const div = document.createElement("div");
        div.className = "fundraiser-card";
        div.innerHTML = `
            <h3>${name}</h3>
            <p>${description}</p>
            <p>Goal: ${goal} ETH</p>
            <p>Raised: ${raised} ETH</p>
            <button onclick="donate('${serial}')">Donate</button>
        `;
        publicContainer.appendChild(div);
    });

    // Render private fundraisers
    privateFundraisers.forEach(f => {
        const { name, description, goal, raised, serial } = f;
        const div = document.createElement("div");
        div.className = "fundraiser-card";
        div.innerHTML = `
            <h3>${name}</h3>
            <p>${description}</p>
            <p>Goal: ${goal} ETH</p>
            <p>Raised: ${raised} ETH</p>
            <button onclick="donate('${serial}')">Donate</button>
        `;
        privateContainer.appendChild(div);
    });
}


  // Render private fundraisers



document.getElementById("connectButton").addEventListener("click", connectWallet);