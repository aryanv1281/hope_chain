import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Web3 from "web3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js'; // ✅ Correct path for import

dotenv.config();

const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const infuraUrl = process.env.INFURA_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Correct route registration
app.use('/auth', authRoutes); // Not './routes/auth'

// Load ABI and contract address
const abi = JSON.parse(fs.readFileSync("./FundraiserABI.json", "utf-8"));
const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
const contract = new web3.eth.Contract(abi, contractAddress);

// ✅ Fundraiser creation
app.post("/create-fundraiser", async (req, res) => {
  const { name, description, fundraiserType, category, peopleAffected, creator } = req.body;

  try {
    const serialNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    await contract.methods.createFundraiser(
      name,
      description,
      fundraiserType, // This is the correct parameter for type
      category,
      parseInt(peopleAffected) // Convert peopleAffected to an integer (uint256 in Solidity)
    ).send({ from: creator });

    res.json({ message: "Fundraiser created successfully" });
  } catch (err) {
    console.error("Error creating fundraiser:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Donation endpoint
app.post("/donate", async (req, res) => {
  const { serialNumber, amount, donor } = req.body;

  try {
    await contract.methods.donateToFundraiser(serialNumber)
      .send({ from: donor, value: web3.utils.toWei(amount, "ether") });

    res.json({ message: "Donation successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all fundraisers
app.get('/fundraisers', async (req, res) => {
  try {
    const count = await contract.methods.fundraiserCount().call();
    const fundraisers = [];

    // Fetch fundraisers and metadata together
    const metadataPath = path.join(__dirname, 'public', 'fundraiser-metadata.json');
    let metadata = [];
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath));
    }

    for (let i = 1; i <= count; i++) {
      const fundraiser = await contract.methods.fundraisers(i).call();
      
      // Find type of fundraiser based on serial
      const fundraiserType = metadata.find(m => m.serial == i.toString())?.type || "Unknown";

      fundraisers.push({
        name: fundraiser.name,
        description: fundraiser.description,
        goal: web3.utils.fromWei(fundraiser.goal, 'ether'),
        raised: web3.utils.fromWei(fundraiser.amountRaised, 'ether'),
        owner: fundraiser.owner,
        serial: i.toString(),
        type: fundraiserType // Add type from metadata
      });
    }

    res.json(fundraisers);  // Corrected line, inside the try block

  } catch (err) {
    console.error("Error fetching fundraisers:", err);
    res.status(500).json({ error: "Failed to fetch fundraisers" });
  }
});

// New route to fetch fundraiser types using the serial numbers
app.get("/fundraiser-types", (req, res) => {
  const metadataPath = path.join(__dirname, 'public', 'fundraiser-metadata.json');
  
  try {
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath));
      res.json(metadata); // [{ serial: 1000000001, type: "Public" }, ...]
    } else {
      res.json([]); // No metadata found
    }
  } catch (err) {
    console.error("Error reading fundraiser metadata:", err);
    res.status(500).json({ error: "Failed to read fundraiser types" });
  }
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:5000`);
});