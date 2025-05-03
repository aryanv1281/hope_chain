import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Import the user model

const router = express.Router();

// Sign-up route (POST)
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists by username or email
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ msg: 'User already exists' });
  }

  try {
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to MongoDB
    await newUser.save();

    // Create and send the JWT token
    const token = jwt.sign({ userId: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(201).json({
      token, // Send the token to the client
      message: 'User registered successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
