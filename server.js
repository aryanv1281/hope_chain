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
  const { name, description, goal, creator } = req.body;

  try {
    const serialNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    await contract.methods.createFundraiser(
      name,
      description,
      web3.utils.toWei(goal, "ether"),
      serialNumber
    ).send({ from: creator });

    res.json({ message: "Fundraiser created", serialNumber });
  } catch (err) {
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
    const fundraisers = await contract.methods.getAllFundraisers().call();
    const fundraiserList = fundraisers.map(f => ({
      name: f.name,
      description: f.description,
      goal: f.goal.toString(),
      owner: f.owner,
      amountRaised: f.amountRaised.toString(),
      serial: f.serial.toString(),
    }));

    res.json(fundraiserList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
