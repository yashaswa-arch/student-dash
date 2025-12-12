const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * Dev-only token generator
 * Only available in non-production environments
 */
router.post('/token', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const { userId = 'dev-user', role = 'user' } = req.body || {};
    const secret = process.env.JWT_SECRET || 'dev_secret';
    
    // Create a token with user info
    const token = jwt.sign(
      { 
        id: userId,
        userId: userId,
        role: role 
      },
      secret,
      { expiresIn: '7d' }
    );
    
    res.json({ success: true, token });
  } catch (error) {
    console.error('Error generating dev token:', error);
    res.status(500).json({ success: false, message: 'Failed to generate token' });
  }
});

module.exports = router;

