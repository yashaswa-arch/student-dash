const codeforcesService = require('./codeforcesService');
const leetcodeService = require('./leetcodeService');
const hackerrankService = require('./hackerrankService');

const services = {
  codeforces: codeforcesService,
  leetcode: leetcodeService,
  hackerrank: hackerrankService
};

/**
 * Get platform service for a given platform
 * @param {string} platform - Platform name (codeforces, leetcode, hackerrank)
 * @returns {object} - Platform service with fetchProfileStats method
 * @throws {Error} - If platform is not supported
 */
function getPlatformService(platform) {
  const normalizedPlatform = platform ? platform.toLowerCase().trim() : null;
  const service = services[normalizedPlatform];
  
  if (!service) {
    throw new Error(`Unsupported platform: ${platform}. Supported platforms: ${Object.keys(services).join(', ')}`);
  }
  
  return service;
}

module.exports = { getPlatformService };

