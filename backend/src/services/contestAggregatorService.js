const axios = require('axios');

/**
 * Normalize platform name to uppercase format
 * @param {string} site - Platform name from aggregator
 * @returns {string} - Normalized platform name (UPPERCASE)
 */
function normalizePlatform(site) {
  // site might be "CodeForces", "CodeChef", "AtCoder", "LeetCode", etc.
  const s = (site || '').toLowerCase();
  
  if (s.includes('codeforces')) return 'CODEFORCES';
  if (s.includes('codechef')) return 'CODECHEF';
  if (s.includes('atcoder')) return 'ATCODER';
  if (s.includes('leetcode')) return 'LEETCODE';
  if (s.includes('hackerrank')) return 'HACKERRANK';
  if (s.includes('hackerearth')) return 'HACKEREARTH';
  
  return site ? site.toUpperCase() : 'OTHER';
}

/**
 * Normalize a single contest from aggregator format to our unified format
 * @param {Object} raw - Raw contest object from aggregator
 * @returns {Object} - Normalized contest object
 */
function normalizeContest(raw) {
  // Contest Hive uses: title, url, startTime, endTime, duration (seconds), platform
  // Kontests uses: name, url, start_time, end_time, duration (seconds), site
  const platform = normalizePlatform(raw.platform || raw.site);
  const start = new Date(raw.startTime || raw.start_time);
  const end = new Date(raw.endTime || raw.end_time || start);
  
  // Duration: Contest Hive provides in seconds, convert to minutes
  let durationMinutes = 0;
  if (raw.duration) {
    if (typeof raw.duration === 'number') {
      durationMinutes = Math.floor(raw.duration / 60); // seconds to minutes
    } else {
      durationMinutes = Math.floor(parseInt(raw.duration) / 60);
    }
  }
  
  // If duration is 0 or invalid, calculate from start/end times
  if (durationMinutes <= 0) {
    durationMinutes = Math.max(1, Math.round((end - start) / 60000));
  }
  
  const name = raw.title || raw.name || 'Untitled Contest';
  const externalId = raw.id ? String(raw.id) : `${platform}-${name}-${start.toISOString()}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  return {
    externalId,
    name,
    platform,
    url: raw.url || raw.link || '#',
    startTime: start,
    endTime: end,
    durationMinutes,
  };
}

/**
 * Fetch all contests from the aggregator API
 * @returns {Promise<Array>} - Raw contest data from aggregator (flattened array)
 * @throws {Error} - If API call fails
 */
async function fetchAllContestsFromAggregator() {
  // Default to Contest Hive API (kontests.net is discontinued)
  const baseUrl = process.env.CONTESTS_API_BASE_URL || 'https://contest-hive.vercel.app/api';
  const url = `${baseUrl}/all`;
  
  try {
    const res = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'SAP-Skill-Analytics-Platform/1.0',
        'Accept': 'application/json'
      }
    });
    
    // Contest Hive returns: { ok: true, data: { platform1: [...], platform2: [...] }, lastUpdated: "..." }
    if (!res.data || !res.data.ok) {
      throw new Error('Invalid response from Contest Hive API');
    }
    
    // Flatten contests from all platforms into a single array
    const allContests = [];
    if (res.data.data && typeof res.data.data === 'object') {
      Object.values(res.data.data).forEach(platformContests => {
        if (Array.isArray(platformContests)) {
          allContests.push(...platformContests);
        }
      });
    }
    
    // If it's already an array (for backward compatibility with other APIs)
    if (Array.isArray(res.data)) {
      return res.data;
    }
    
    if (allContests.length === 0) {
      console.warn('No contests found in API response');
    }
    
    return allContests;
  } catch (error) {
    if (error.response) {
      throw new Error(`Contests API error: ${error.response.status} ${error.response.statusText}`);
    }
    if (error.request) {
      throw new Error('Failed to connect to contests API');
    }
    throw new Error(`Failed to fetch contests: ${error.message}`);
  }
}

module.exports = { 
  fetchAllContestsFromAggregator, 
  normalizeContest 
};
