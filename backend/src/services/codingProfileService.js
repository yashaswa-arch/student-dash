const CodingProfile = require('../models/CodingProfile');
const { fetchCodeforcesStats } = require('./codeforcesService');

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

    if (profile.platform === 'CODEFORCES') {
      // Fetch stats from Codeforces API
      const stats = await fetchCodeforcesStats(profile.handle);
      
      // Update profile stats with fetched data
      profile.stats = {
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        rating: stats.rating,
        maxRating: stats.maxRating,
        contestsPlayed: stats.contestsPlayed,
        rank: stats.rank,
        raw: stats.raw
      };
    } else if (profile.platform === 'HACKERRANK') {
      // For HackerRank, keep stats as-is or initialize if missing
      if (!profile.stats) {
        profile.stats = {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          rating: null,
          maxRating: null,
          contestsPlayed: 0,
          rank: null,
          raw: null
        };
      }
    }

    // Update last synced timestamp
    profile.lastSyncedAt = new Date();

    // Save and return the updated document
    const updatedProfile = await profile.save();
    return updatedProfile;

  } catch (error) {
    throw new Error(`Failed to sync coding profile: ${error.message}`);
  }
}

module.exports = { syncCodingProfile };

