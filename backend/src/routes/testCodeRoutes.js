const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/code-execution/test
 * @desc    Test route
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Code execution routes working!'
  });
});

module.exports = router;