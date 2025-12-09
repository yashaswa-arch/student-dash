const CodingProfile = require('../models/CodingProfile');
const { syncCodingProfile } = require('../services/codingProfileService');

/**
 * Upsert coding profile (create or update)
 * @route POST /api/coding-profiles
 */
const upsertProfile = async (req, res) => {
  try {
    let { platform, handle, profileUrl } = req.body;

    // Validation
    if (!platform || !['CODEFORCES', 'HACKERRANK'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be either CODEFORCES or HACKERRANK'
      });
    }

    // Handle Codeforces URL extraction
    if (platform === 'CODEFORCES') {
      handle = handle ? handle.trim() : '';
      
      // If handle is empty but profileUrl is provided, try to extract handle from URL
      if (!handle && profileUrl) {
        const urlPattern = /codeforces\.com\/profile\/([^\/\?#]+)/i;
        const match = profileUrl.match(urlPattern);
        if (match && match[1]) {
          handle = match[1].trim();
        }
      }
    } else {
      // For HackerRank, just trim the handle
      handle = handle ? handle.trim() : '';
    }

    // Final validation: handle must be present
    if (!handle || handle === '') {
      return res.status(400).json({
        success: false,
        message: 'Handle or valid profile URL is required.'
      });
    }

    // Find existing profile
    let profile = await CodingProfile.findOne({
      user: req.user._id,
      platform: platform
    });

    if (profile) {
      // Update existing profile
      profile.handle = handle;
      if (profileUrl) {
        profile.profileUrl = profileUrl.trim();
      }
    } else {
      // Create new profile
      profile = new CodingProfile({
        user: req.user._id,
        platform: platform,
        handle: handle,
        profileUrl: profileUrl ? profileUrl.trim() : undefined
      });
    }

    // Save the profile
    await profile.save();

    // Sync stats from external platform (if applicable)
    try {
      await syncCodingProfile(profile);
    } catch (syncError) {
      // Log sync error but don't fail the request
      console.error('Failed to sync profile stats:', syncError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Coding profile saved',
      data: profile
    });

  } catch (error) {
    console.error('Error upserting coding profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save coding profile'
    });
  }
};

/**
 * Get all coding profiles for the authenticated user
 * @route GET /api/coding-profiles
 */
const getMyProfiles = async (req, res) => {
  try {
    const profiles = await CodingProfile.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: profiles
    });

  } catch (error) {
    console.error('Error fetching coding profiles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coding profiles'
    });
  }
};

/**
 * Sync a specific coding profile by ID
 * @route POST /api/coding-profiles/:id/sync
 */
const syncProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find profile belonging to the authenticated user
    const profile = await CodingProfile.findOne({
      _id: id,
      user: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Sync the profile
    const updatedProfile = await syncCodingProfile(profile);

    res.status(200).json({
      success: true,
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error syncing coding profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync coding profile'
    });
  }
};

/**
 * Delete/unlink a coding profile
 * @route DELETE /api/coding-profiles/:id
 */
const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find profile belonging to the authenticated user
    const profile = await CodingProfile.findOne({
      _id: id,
      user: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Delete the profile
    await CodingProfile.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Coding profile unlinked successfully'
    });

  } catch (error) {
    console.error('Error deleting coding profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete coding profile'
    });
  }
};

module.exports = {
  upsertProfile,
  getMyProfiles,
  syncProfileById,
  deleteProfile
};

