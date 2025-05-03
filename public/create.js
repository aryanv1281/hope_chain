document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("type");
  const categorySection = document.getElementById("categorySection");
  const categorySelect = document.getElementById("category");
  const extraInputSection = document.getElementById("extraInputSection");
  const extraInput = document.getElementById("extraInput");
  const extraLabel = document.getElementById("extraLabel");
  const form = document.getElementById("fundraiserForm");

  // Define contract ABI and address here
  const contractABI = [
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
  ];  // Replace with the actual ABI of your contract
  const contractAddress = "0xff56A0B61E3Eb8ec0e35923bEa093De3e268cA9C"; // Replace with your deployed contract address

  const publicOptions = ["Flood", "Drought", "Tsunami"];
  const privateOptions = ["Heart Disease", "Cancer"];

  typeSelect.addEventListener("change", () => {
    const selectedType = typeSelect.value;

    if (selectedType === "Public") {
      populateOptions(publicOptions);
      extraLabel.textContent = "Number of people affected:";
    } else if (selectedType === "Private") {
      populateOptions(privateOptions);
      extraLabel.textContent = "Severity level (1-10):";
    }

    categorySection.style.display = "block";
    extraInputSection.style.display = "block";
  });

  function populateOptions(options) {
    categorySelect.innerHTML = '<option value="">--Select--</option>';
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      categorySelect.appendChild(option);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const type = typeSelect.value;
    const category = categorySelect.value;
    const extra = extraInput.value;

    if (!name || !description || !type || !category || !extra) {
      alert("Please fill all the fields.");
      return;
    }

    let estimatedBudget;
    if (type === "Public") {
      estimatedBudget = parseInt(extra) * 100;
    } else {
      estimatedBudget = parseInt(extra) * 1000;
    }

    const rupees = estimatedBudget;
    const etherEquivalent = rupees / 200000;

    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        let accounts = await web3.eth.getAccounts();

        if (accounts.length === 0) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          accounts = await web3.eth.getAccounts();
        }

        const creator = accounts[0];

        // Initialize the contract
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Send the transaction to create a fundraiser
        const tx = await contract.methods.createFundraiser(
          name,
          description,
          type.toLowerCase(),
          category.toLowerCase(),
          parseInt(extra)
        ).send({ from: creator });

        // Send POST request to your backend
        const response = await fetch("http://localhost:5000/create-fundraiser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            goal: etherEquivalent.toString(),
            creator,
            type,
            category,
            extra,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(✅ Fundraiser Created!\nName: ${name}\nType: ${type} (${category})\nTarget: ₹${rupees});
        } else {
          alert(❌ Error
