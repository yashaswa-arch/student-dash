// Quick fix: Create an admin user endpoint for development
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Development only - create admin user
router.post('/dev-create-admin', async (req, res) => {
  try {
    // Delete any existing admin
    await User.deleteMany({ email: 'admin@dev.com' });
    
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    const adminUser = new User({
      username: 'admin',
      email: 'admin@dev.com',
      passwordHash,
      role: 'admin',
      name: 'Admin User'
    });

    await adminUser.save();

    res.json({
      success: true,
      message: 'Dev admin created',
      credentials: {
        email: 'admin@dev.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Dev admin creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating dev admin',
      error: error.message 
    });
  }
});

// Promote specific user to admin
router.post('/promote-to-admin', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User promoted to admin',
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error promoting user',
      error: error.message
    });
  }
});

module.exports = router;