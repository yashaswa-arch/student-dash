const axios = require('axios');

/**
 * Fetch Codeforces user profile statistics
 * @param {string} handle - Codeforces username/handle
 * @returns {Promise<object>} - Standardized profile stats object
 * @throws {Error} - If user not found or API error
 */
async function fetchProfileStats(handle) {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000 // 10 seconds
      }
    );

    // Check if API response status is OK
    if (response.data.status !== 'OK') {
      throw new Error('Codeforces user not found');
    }

    // Check if user data exists
    if (!response.data.result || response.data.result.length === 0) {
      throw new Error('Codeforces user not found');
    }

    const user = response.data.result[0];

    // Map to standardized format
    return {
      profileUrl: `https://codeforces.com/profile/${handle}`,
      displayName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.handle || handle,
      avatarUrl: user.titlePhoto || user.avatar || null,
      stats: {
        totalSolved: null, // Codeforces API doesn't provide this directly
        easySolved: null,
        mediumSolved: null,
        hardSolved: null,
        rating: user.rating || null,
        maxRating: user.maxRating || null,
        badges: [], // Codeforces doesn't have badges in the API
        lastContest: null // Would need additional API call to get this
      }
    };

  } catch (error) {
    if (error.response) {
      // API returned an error response
      if (error.response.data?.comment) {
        throw new Error(`Codeforces API error: ${error.response.data.comment}`);
      }
      throw new Error('Codeforces user not found');
    }
    
    if (error.message && error.message.includes('Codeforces')) {
      // Re-throw our custom errors
      throw error;
    }

    // Network or other errors
    throw new Error(`Failed to fetch Codeforces stats: ${error.message}`);
  }
}

module.exports = { fetchProfileStats };

