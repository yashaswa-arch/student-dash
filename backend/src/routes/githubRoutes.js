const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getGithubProfile,
  updateGithubProfile,
  getGithubStats
} = require('../controllers/githubController');

// Apply auth middleware to all routes
router.use(auth);

// Profile routes
router.get('/profile/github', getGithubProfile);
router.put('/profile/github', updateGithubProfile);

// Stats route
router.get('/github/stats', getGithubStats);

module.exports = router;

