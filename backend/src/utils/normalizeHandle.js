/**
 * Normalize handle/profile URL input to extract the handle for a given platform
 * @param {string} platform - Platform name (codeforces, leetcode, hackerrank)
 * @param {string} input - Handle or profile URL
 * @returns {string} - Normalized handle
 */
function normalizeHandle(platform, input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmedInput = input.trim();
  
  // If input doesn't start with http/https, treat it as a plain handle
  if (!trimmedInput.startsWith('http://') && !trimmedInput.startsWith('https://')) {
    return trimmedInput;
  }

  try {
    const url = new URL(trimmedInput);
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    
    if (pathSegments.length === 0) {
      throw new Error('Invalid URL: no path segments found');
    }

    switch (platform.toLowerCase()) {
      case 'codeforces': {
        // Codeforces: /profile/<handle>
        const profileIndex = pathSegments.findIndex(seg => seg === 'profile');
        if (profileIndex !== -1 && profileIndex < pathSegments.length - 1) {
          return pathSegments[profileIndex + 1];
        }
        // Fallback: try to find handle in path
        if (pathSegments.length > 0) {
          return pathSegments[pathSegments.length - 1];
        }
        throw new Error('Could not extract handle from Codeforces URL');
      }

      case 'leetcode': {
        // LeetCode: /<handle> or /u/<handle> or /user/<handle>
        // Get the last non-empty path segment
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          // Skip common LeetCode path segments
          if (lastSegment !== 'u' && lastSegment !== 'user' && lastSegment !== 'profile') {
            return lastSegment;
          }
          // If last segment is 'u' or 'user', get the one before it
          if (pathSegments.length > 1) {
            return pathSegments[pathSegments.length - 2];
          }
        }
        throw new Error('Could not extract handle from LeetCode URL');
      }

      case 'hackerrank': {
        // HackerRank: /profile/<handle> or just /<handle>
        const profileIndex = pathSegments.findIndex(seg => seg === 'profile');
        if (profileIndex !== -1 && profileIndex < pathSegments.length - 1) {
          return pathSegments[profileIndex + 1];
        }
        // Fallback: last path segment
        if (pathSegments.length > 0) {
          return pathSegments[pathSegments.length - 1];
        }
        throw new Error('Could not extract handle from HackerRank URL');
      }

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    // If URL parsing fails, treat input as plain handle
    if (error instanceof TypeError || error.message.includes('Invalid URL')) {
      return trimmedInput;
    }
    // Re-throw other errors
    throw error;
  }
}

module.exports = { normalizeHandle };

