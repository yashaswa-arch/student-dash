const CodingProfile = require('../models/CodingProfile');
const { getPlatformService } = require('./codingPlatforms');
const { normalizeHandle } = require('../utils/normalizeHandle');

/**
 * Normalize platform name to lowercase
 * @param {string} platform - Platform name (case-insensitive)
 * @returns {string} - Normalized platform name
 */
function normalizePlatform(platform) {
  if (!platform) return null;
  const normalized = platform.toLowerCase().trim();
  
  // Handle legacy uppercase values
  if (normalized === 'codeforces' || normalized === 'CODEFORCES' || normalized === 'cf') {
    return 'codeforces';
  }
  if (normalized === 'leetcode' || normalized === 'LEETCODE' || normalized === 'lc') {
    return 'leetcode';
  }
  if (normalized === 'hackerrank' || normalized === 'HACKERRANK' || normalized === 'hr') {
    return 'hackerrank';
  }
  
  return normalized;
}

/**
 * Sync coding profile statistics from external platform
 * @param {object} profile - CodingProfile mongoose document
 * @returns {Promise<object>} - Updated CodingProfile document
 */
async function syncCodingProfile(profile) {
  try {
    // Ensure profile is a mongoose document
    if (!profile || !profile.platform) {
      throw new Error('Invalid profile: platform is required');
    }

    // Normalize platform to lowercase
    const platform = normalizePlatform(profile.platform);
    
    // Ensure platform is normalized in the document
    if (profile.platform !== platform) {
      profile.platform = platform;
    }

    // Get the appropriate platform service
    const platformService = getPlatformService(platform);
    
    // Fetch stats using the standardized service interface
    const profileData = await platformService.fetchProfileStats(profile.handle);
    
    // Update profile fields from fetched data
    profile.profileUrl = profileData.profileUrl || profile.profileUrl;
    profile.displayName = profileData.displayName || profile.displayName;
    profile.avatarUrl = profileData.avatarUrl || profile.avatarUrl;
    
    // Update stats - merge with existing stats to preserve any custom data
    profile.stats = {
      totalSolved: profileData.stats.totalSolved ?? profile.stats?.totalSolved ?? 0,
      easySolved: profileData.stats.easySolved ?? profile.stats?.easySolved ?? 0,
      mediumSolved: profileData.stats.mediumSolved ?? profile.stats?.mediumSolved ?? 0,
      hardSolved: profileData.stats.hardSolved ?? profile.stats?.hardSolved ?? 0,
      rating: profileData.stats.rating ?? profile.stats?.rating ?? null,
      maxRating: profileData.stats.maxRating ?? profile.stats?.maxRating ?? null,
      badges: profileData.stats.badges?.length > 0 
        ? profileData.stats.badges 
        : (profile.stats?.badges || []),
      lastContest: profileData.stats.lastContest ?? profile.stats?.lastContest ?? null,
      // Legacy fields for backward compatibility (preserve if they exist)
      contestsPlayed: profile.stats?.contestsPlayed ?? 0,
      rank: profile.stats?.rank ?? null,
      raw: profile.stats?.raw ?? null
    };

    // Update last synced timestamp
    profile.lastSyncedAt = new Date();

    // Save and return the updated document
    const updatedProfile = await profile.save();
    return updatedProfile;

  } catch (error) {
    throw new Error(`Failed to sync coding profile: ${error.message}`);
  }
}

module.exports = { syncCodingProfile, normalizePlatform };

