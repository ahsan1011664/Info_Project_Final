const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username already exists' 
      });
    }

    // Hash password with bcrypt (10 salt rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user (publicKey will be added later by frontend)
    const user = new User({
      username,
      passwordHash
    });

    await user.save();

    // Log successful registration (for security auditing)
<<<<<<< HEAD
    console.log(`[AUTH] User registered: ${username} at ${new Date().toISOString()}`);
=======
    console.log(`[AUTH] ✅ User registered: username=${username}, userId=${user._id}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)

    // Return success (NO password or passwordHash in response)
    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      username: user.username
    });

  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      // Log failed login attempt
<<<<<<< HEAD
      console.log(`[AUTH] Failed login attempt - User not found: ${username} at ${new Date().toISOString()}`);
=======
      console.log(`[AUTH] ❌ Failed login attempt - User not found: username=${username}, ip=${req.ip || 'unknown'}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login attempt
<<<<<<< HEAD
      console.log(`[AUTH] Failed login attempt - Invalid password: ${username} at ${new Date().toISOString()}`);
=======
      console.log(`[AUTH] ❌ Failed login attempt - Invalid password: username=${username}, ip=${req.ip || 'unknown'}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: '24h' }
    );

    // Log successful login
<<<<<<< HEAD
    console.log(`[AUTH] User logged in: ${username} at ${new Date().toISOString()}`);
=======
    console.log(`[AUTH] ✅ User logged in: username=${username}, userId=${user._id}, ip=${req.ip || 'unknown'}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)

    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      username: user.username,
      hasPublicKey: !!user.publicKey
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

// Update public key (called after key generation on frontend)
router.post('/update-public-key', async (req, res) => {
  try {
    const { username, publicKey, keyAlgorithm } = req.body;

    if (!username || !publicKey || !keyAlgorithm) {
      return res.status(400).json({ 
        error: 'Username, publicKey, and keyAlgorithm are required' 
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    user.publicKey = publicKey;
    user.keyAlgorithm = keyAlgorithm;
    await user.save();

<<<<<<< HEAD
    console.log(`[AUTH] Public key updated for user: ${username} at ${new Date().toISOString()}`);
=======
    console.log(`[AUTH] 🔑 Public key updated: username=${username}, algorithm=${keyAlgorithm}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)

    res.json({
      message: 'Public key updated successfully'
    });

  } catch (error) {
    console.error('[AUTH] Public key update error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Get user's public key (for key exchange)
router.get('/public-key/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (!user.publicKey) {
<<<<<<< HEAD
=======
      console.log(`[AUTH] ⚠️ Public key access denied - Not found: requestedBy=${req.user?.username || 'unknown'}, targetUser=${username}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
      return res.status(404).json({ 
        error: 'Public key not found for this user' 
      });
    }

<<<<<<< HEAD
=======
    // Log server-side metadata access (public key retrieval)
    console.log(`[AUTH] 📋 Server-side metadata access: publicKey retrieved, requestedBy=${req.user?.username || 'unknown'}, targetUser=${username}, timestamp=${new Date().toISOString()}`);

>>>>>>> 44486ae (Full Deployment)
    res.json({
      username: user.username,
      publicKey: user.publicKey,
      keyAlgorithm: user.keyAlgorithm
    });

  } catch (error) {
    console.error('[AUTH] Get public key error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;

