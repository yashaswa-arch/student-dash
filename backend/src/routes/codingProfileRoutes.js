const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  upsertProfile,
  getMyProfiles,
  syncProfileById,
  deleteProfile
} = require('../controllers/codingProfileController');

// Apply auth middleware to all routes in this router
router.use(auth);

// POST /api/coding-profiles - Create or update coding profile
router.post('/', upsertProfile);

// GET /api/coding-profiles/me - Get all coding profiles for authenticated user
router.get('/me', getMyProfiles);

// POST /api/coding-profiles/:id/sync - Sync a specific coding profile by ID
router.post('/:id/sync', syncProfileById);

// DELETE /api/coding-profiles/:id - Delete/unlink a coding profile
router.delete('/:id', deleteProfile);

module.exports = router;

