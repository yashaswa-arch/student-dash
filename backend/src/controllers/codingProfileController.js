const CodingProfile = require('../models/CodingProfile');
const { syncCodingProfile, normalizePlatform } = require('../services/codingProfileService');
const { normalizeHandle } = require('../utils/normalizeHandle');
const { getPlatformService } = require('../services/codingPlatforms');

/**
 * Upsert coding profile (create or update)
 * @route POST /api/coding-profiles
 */
const upsertProfile = async (req, res) => {
  try {
    let { platform, handle, profileUrl } = req.body;

    // Normalize platform to lowercase (handles legacy uppercase values)
    if (platform) {
      platform = normalizePlatform(platform);
    }

    // Validation - support codeforces, leetcode, hackerrank
    if (!platform || !['codeforces', 'leetcode', 'hackerrank'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be one of: codeforces, leetcode, hackerrank'
      });
    }

    // Normalize handle from either handle or profileUrl input
    // Use profileUrl if handle is not provided, otherwise use handle
    const input = handle || profileUrl;
    
    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Handle or profile URL is required.'
      });
    }

    try {
      // normalizeHandle will extract handle from URL or return the handle as-is
      handle = normalizeHandle(platform, input);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Invalid handle or URL: ${error.message}`
      });
    }

    // If profileUrl was provided as input and it's a URL, use it; otherwise construct it
    if (!profileUrl && input.startsWith('http')) {
      profileUrl = input;
    }

    // Find existing profile
    let profile = await CodingProfile.findOne({
      user: req.user._id,
      platform: platform
    });

    if (profile) {
      // Update existing profile
      profile.handle = handle;
      profile.platform = platform; // Update platform in case it changed
      if (profileUrl) {
        profile.profileUrl = profileUrl.trim();
      }
    } else {
      // Create new profile
      profile = new CodingProfile({
        user: req.user._id,
        platform: platform,
        handle: handle,
        profileUrl: profileUrl ? profileUrl.trim() : null
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

/**
 * Link a coding profile (create or update with stats fetch)
 * @route POST /api/coding-profiles/link
 */
const linkProfile = async (req, res) => {
  try {
    const { platform, input } = req.body;

    // Validate platform
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required'
      });
    }

    const normalizedPlatform = normalizePlatform(platform);
    if (!['codeforces', 'leetcode', 'hackerrank'].includes(normalizedPlatform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be one of: codeforces, leetcode, hackerrank'
      });
    }

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Input (handle or profile URL) is required'
      });
    }

    // Normalize handle from input
    let handle;
    try {
      handle = normalizeHandle(normalizedPlatform, input);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Invalid handle or URL: ${error.message}`
      });
    }

    // Fetch stats from platform service
    let profileData;
    try {
      const platformService = getPlatformService(normalizedPlatform);
      profileData = await platformService.fetchProfileStats(handle);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: `Failed to fetch profile stats: ${error.message}`
      });
    }

    // Upsert the profile
    const profile = await CodingProfile.findOneAndUpdate(
      {
        user: req.user._id,
        platform: normalizedPlatform
      },
      {
        user: req.user._id,
        platform: normalizedPlatform,
        handle: handle,
        profileUrl: profileData.profileUrl,
        displayName: profileData.displayName,
        avatarUrl: profileData.avatarUrl,
        stats: profileData.stats,
        lastSyncedAt: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Coding profile linked successfully',
      data: profile
    });

  } catch (error) {
    console.error('Error linking coding profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to link coding profile'
    });
  }
};

/**
 * Sync a coding profile by platform
 * @route POST /api/coding-profiles/sync
 */
const syncProfile = async (req, res) => {
  try {
    const { platform } = req.body;

    // Validate platform
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required'
      });
    }

    const normalizedPlatform = normalizePlatform(platform);
    if (!['codeforces', 'leetcode', 'hackerrank'].includes(normalizedPlatform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be one of: codeforces, leetcode, hackerrank'
      });
    }

    // Find existing profile
    const profile = await CodingProfile.findOne({
      user: req.user._id,
      platform: normalizedPlatform
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `No ${normalizedPlatform} profile found. Please link a profile first.`
      });
    }

    // Fetch updated stats from platform service
    let profileData;
    try {
      const platformService = getPlatformService(normalizedPlatform);
      profileData = await platformService.fetchProfileStats(profile.handle);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: `Failed to fetch profile stats: ${error.message}`
      });
    }

    // Update profile with new data
    profile.profileUrl = profileData.profileUrl || profile.profileUrl;
    profile.displayName = profileData.displayName || profile.displayName;
    profile.avatarUrl = profileData.avatarUrl || profile.avatarUrl;
    profile.stats = {
      ...profile.stats,
      ...profileData.stats,
      // Preserve legacy fields if they exist
      contestsPlayed: profile.stats?.contestsPlayed ?? 0,
      rank: profile.stats?.rank ?? null,
      raw: profile.stats?.raw ?? null
    };
    profile.lastSyncedAt = new Date();

    const updatedProfile = await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile synced successfully',
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
 * Unlink a coding profile by platform
 * @route DELETE /api/coding-profiles
 */
const unlinkProfile = async (req, res) => {
  try {
    const { platform } = req.body;

    // Validate platform
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required'
      });
    }

    const normalizedPlatform = normalizePlatform(platform);
    if (!['codeforces', 'leetcode', 'hackerrank'].includes(normalizedPlatform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be one of: codeforces, leetcode, hackerrank'
      });
    }

    // Find and delete the profile - try both normalized and any case variations
    // First try exact match with normalized platform
    let result = await CodingProfile.findOneAndDelete({
      user: req.user._id,
      platform: normalizedPlatform
    });

    // If not found, try case-insensitive search for legacy data
    if (!result) {
      const allProfiles = await CodingProfile.find({
        user: req.user._id
      }).lean();
      
      const matchingProfile = allProfiles.find(p => 
        p.platform && p.platform.toLowerCase() === normalizedPlatform.toLowerCase()
      );
      
      if (matchingProfile) {
        console.log('🔧 Found legacy platform name, deleting:', {
          found: matchingProfile.platform,
          normalized: normalizedPlatform,
          id: matchingProfile._id
        });
        result = await CodingProfile.findByIdAndDelete(matchingProfile._id);
      }
    }

    if (!result) {
      // Check if any profiles exist for this user
      const anyProfiles = await CodingProfile.find({ user: req.user._id }).lean();
      console.log('❌ Profile not found for unlink:', {
        requestedPlatform: normalizedPlatform,
        userId: req.user._id,
        existingProfiles: anyProfiles.map(p => ({ platform: p.platform, id: p._id }))
      });
      
      return res.status(404).json({
        success: false,
        message: `No ${normalizedPlatform} profile found to unlink`
      });
    }

    // Verify deletion by checking remaining profiles
    const remainingProfiles = await CodingProfile.countDocuments({
      user: req.user._id
    });
    
    console.log('🗑️  Profile unlinked:', {
      platform: normalizedPlatform,
      userId: req.user._id,
      remainingProfilesCount: remainingProfiles
    });

    res.status(200).json({
      success: true,
      message: `${normalizedPlatform} profile unlinked successfully`,
      remainingProfiles: remainingProfiles
    });

  } catch (error) {
    console.error('Error unlinking coding profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unlink coding profile'
    });
  }
};

/**
 * Get demo data for testing UI when no profiles exist
 * Only used in DEMO_MODE and non-production environments
 */
const getDemoData = () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  return {
    summary: {
      totalSolved: 420,
      platformsConnected: 3,
      lastSyncedAt: oneHourAgo.toISOString()
    },
    platforms: [
      {
        _id: 'demo-codeforces-1',
        platform: 'codeforces',
        handle: 'demo_coder',
        profileUrl: 'https://codeforces.com/profile/demo_coder',
        displayName: 'Demo Coder',
        avatarUrl: null,
        lastSyncedAt: oneHourAgo.toISOString(),
        stats: {
          totalSolved: 250,
          easySolved: null,
          mediumSolved: null,
          hardSolved: null,
          rating: 1850,
          maxRating: 2100,
          badges: [],
          lastContest: 'Codeforces Round 950'
        },
        createdAt: twoHoursAgo.toISOString(),
        updatedAt: oneHourAgo.toISOString()
      },
      {
        _id: 'demo-leetcode-1',
        platform: 'leetcode',
        handle: 'demo_solver',
        profileUrl: 'https://leetcode.com/demo_solver',
        displayName: 'Demo Solver',
        avatarUrl: null,
        lastSyncedAt: oneHourAgo.toISOString(),
        stats: {
          totalSolved: 120,
          easySolved: 65,
          mediumSolved: 40,
          hardSolved: 15,
          rating: 1850,
          maxRating: 1950,
          badges: [],
          lastContest: 'Weekly Contest 385'
        },
        createdAt: twoHoursAgo.toISOString(),
        updatedAt: oneHourAgo.toISOString()
      },
      {
        _id: 'demo-hackerrank-1',
        platform: 'hackerrank',
        handle: 'demo_hacker',
        profileUrl: 'https://www.hackerrank.com/profile/demo_hacker',
        displayName: 'Demo Hacker',
        avatarUrl: null,
        lastSyncedAt: twoHoursAgo.toISOString(),
        stats: {
          totalSolved: 50,
          easySolved: 25,
          mediumSolved: 20,
          hardSolved: 5,
          rating: null,
          maxRating: null,
          badges: [
            { name: 'Problem Solving', level: 'Intermediate' },
            { name: 'Python', level: 'Advanced' },
            { name: 'Java', level: 'Intermediate' },
            { name: '30 Days of Code', level: 'Completed' },
            { name: 'Data Structures', level: 'Beginner' },
            { name: 'Algorithms', level: 'Intermediate' }
          ],
          lastContest: 'HackerRank Challenge 2024'
        },
        createdAt: twoHoursAgo.toISOString(),
        updatedAt: twoHoursAgo.toISOString()
      }
    ]
  };
};

/**
 * Get summary of all coding profiles for the current user
 * @route GET /api/coding-profiles/summary
 */
const getProfileSummary = async (req, res) => {
  try {
    // Check for demo mode (only in non-production environments)
    // Enable by default in development unless explicitly disabled
    const isProduction = process.env.NODE_ENV === 'production';
    const isDemoMode = !isProduction && (
      process.env.DEMO_MODE === 'true' || 
      process.env.DEMO_MODE === '1' ||
      process.env.DEMO_MODE === undefined || // Not set = enable in dev
      process.env.DEMO_MODE === ''
    ) && process.env.DEMO_MODE !== 'false';
    
    // Load all CodingProfile docs for the current user
    // Query without platform filter to catch any legacy uppercase platforms
    const allUserProfiles = await CodingProfile.find({
      user: req.user._id
    }).lean();

    // Filter to only include valid lowercase platforms (normalize any legacy data)
    const profiles = allUserProfiles
      .map(profile => {
        // Normalize platform to lowercase if it's uppercase (legacy data)
        if (profile.platform && profile.platform !== profile.platform.toLowerCase()) {
          console.warn('⚠️  Found legacy uppercase platform:', {
            original: profile.platform,
            normalized: profile.platform.toLowerCase(),
            id: profile._id
          });
          profile.platform = profile.platform.toLowerCase();
        }
        return profile;
      })
      .filter(profile => ['codeforces', 'leetcode', 'hackerrank'].includes(profile.platform))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Also check with countDocuments to verify
    const profileCount = await CodingProfile.countDocuments({
      user: req.user._id
    });

    // Log what profiles were found
    console.log('📋 Profile Summary Query:', {
      userId: req.user._id,
      allProfilesFound: allUserProfiles.length,
      validProfilesFound: profiles.length,
      profileCount: profileCount,
      allPlatforms: allUserProfiles.map(p => ({ platform: p.platform, id: p._id, handle: p.handle })),
      validPlatforms: profiles.map(p => ({ platform: p.platform, id: p._id, handle: p.handle }))
    });
    
    // If there's a mismatch, log a warning
    if (profiles.length !== profileCount) {
      console.warn('⚠️  Mismatch between find() and countDocuments():', {
        findCount: profiles.length,
        countDocumentsCount: profileCount,
        allProfilesCount: allUserProfiles.length
      });
    }

    // If demo mode is enabled and no profiles exist, return demo data
    // Only works in non-production environments for safety
    if (isDemoMode && profiles.length === 0 && !isProduction) {
      console.log('🎭 DEMO MODE ACTIVATED: Returning demo coding profile data');
      console.log('🔍 Demo Mode Check:', {
        isDemoMode,
        isProduction,
        profilesCount: profiles.length,
        DEMO_MODE: process.env.DEMO_MODE,
        NODE_ENV: process.env.NODE_ENV,
        userId: req.user._id
      });
      
      const demoData = getDemoData();
      console.log('📦 Demo Data:', {
        summary: demoData.summary,
        platformsCount: demoData.platforms.length,
        platforms: demoData.platforms.map(p => ({ platform: p.platform, handle: p.handle }))
      });
      
      return res.status(200).json({
        success: true,
        summary: demoData.summary,
        platforms: demoData.platforms
      });
    } else if (profiles.length === 0) {
      // Log why demo mode isn't activating
      console.log('ℹ️  No profiles found, demo mode status:', {
        isDemoMode,
        isProduction,
        profilesCount: profiles.length,
        DEMO_MODE: process.env.DEMO_MODE,
        NODE_ENV: process.env.NODE_ENV,
        reason: isProduction ? 'Production environment blocks demo mode' : 
                !isDemoMode ? 'DEMO_MODE not enabled' : 'Unknown'
      });
    }

    // Compute aggregated stats
    let totalSolved = 0;
    let lastSyncedAt = null;

    profiles.forEach(profile => {
      // Sum totalSolved (ignore nulls)
      if (profile.stats?.totalSolved != null && typeof profile.stats.totalSolved === 'number') {
        totalSolved += profile.stats.totalSolved;
      }

      // Find most recent lastSyncedAt
      if (profile.lastSyncedAt) {
        const syncedDate = new Date(profile.lastSyncedAt);
        if (!lastSyncedAt || syncedDate > new Date(lastSyncedAt)) {
          lastSyncedAt = profile.lastSyncedAt;
        }
      }
    });

    // Format lastSyncedAt as ISO string or null
    const lastSyncedAtISO = lastSyncedAt ? new Date(lastSyncedAt).toISOString() : null;

    const response = {
      success: true,
      summary: {
        totalSolved,
        platformsConnected: profiles.length,
        lastSyncedAt: lastSyncedAtISO
      },
      platforms: profiles
    };

    console.log('📤 Sending summary response:', {
      platformsConnected: response.summary.platformsConnected,
      platformsCount: response.platforms.length,
      platformNames: response.platforms.map(p => p.platform)
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching profile summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile summary'
    });
  }
};

module.exports = {
  // New standardized endpoints
  linkProfile,
  syncProfile,
  unlinkProfile,
  getMyProfiles,
  getProfileSummary,
  // Legacy endpoints (kept for backward compatibility)
  upsertProfile,
  syncProfileById,
  deleteProfile
};

