const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  linkProfile,
  syncProfile,
  unlinkProfile,
  getMyProfiles,
  getProfileSummary,
  // Legacy endpoints
  upsertProfile,
  syncProfileById,
  deleteProfile
} = require('../controllers/codingProfileController');

// Apply auth middleware to all routes in this router
router.use(auth);

// New standardized endpoints (must come before generic routes)
// POST /api/coding-profiles/link - Link a coding profile
router.post('/link', linkProfile);

// POST /api/coding-profiles/sync - Sync a coding profile by platform
router.post('/sync', syncProfile);

// DELETE /api/coding-profiles - Unlink a coding profile by platform
router.delete('/', unlinkProfile);

// GET /api/coding-profiles/me - Get all coding profiles for authenticated user
router.get('/me', getMyProfiles);

// GET /api/coding-profiles/summary - Get summary of all coding profiles with aggregated stats
router.get('/summary', getProfileSummary);

// Legacy endpoints (kept for backward compatibility)
// POST /api/coding-profiles - Create or update coding profile (legacy)
router.post('/', upsertProfile);

// POST /api/coding-profiles/:id/sync - Sync a specific coding profile by ID (legacy)
router.post('/:id/sync', syncProfileById);

// DELETE /api/coding-profiles/:id - Delete/unlink a coding profile by ID (legacy)
router.delete('/:id', deleteProfile);

module.exports = router;

