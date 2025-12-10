const User = require('../models/User');
const axios = require('axios');

/**
 * @route   GET /api/profile/github
 * @desc    Get GitHub username for logged-in user
 * @access  Private
 */
const getGithubProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('githubUsername');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        githubUsername: user.githubUsername || null
      }
    });
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub profile',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/profile/github
 * @desc    Update GitHub username for logged-in user
 * @access  Private
 */
const updateGithubProfile = async (req, res) => {
  try {
    let { githubUsername } = req.body;

    if (!githubUsername || typeof githubUsername !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required'
      });
    }

    // Normalize input: extract username from URL if provided
    githubUsername = githubUsername.trim();
    
    // Check if it's a GitHub URL
    if (githubUsername.includes('github.com')) {
      // Extract username from URL
      // Examples: https://github.com/username, https://www.github.com/username, github.com/username
      const urlPattern = /github\.com\/([^\/\?#]+)/i;
      const match = githubUsername.match(urlPattern);
      
      if (match && match[1]) {
        githubUsername = match[1].trim();
        // Remove any trailing slashes or query params
        githubUsername = githubUsername.split('/')[0].split('?')[0].trim();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid GitHub URL format'
        });
      }
    }

    // Validate username format (basic check)
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$/.test(githubUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub username format'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { githubUsername },
      { new: true, runValidators: true }
    ).select('githubUsername');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'GitHub username updated successfully',
      data: {
        githubUsername: user.githubUsername
      }
    });
  } catch (error) {
    console.error('Error updating GitHub profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update GitHub profile',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/github/stats
 * @desc    Get GitHub stats for logged-in user
 * @access  Private
 */
const getGithubStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('githubUsername');
    
    if (!user || !user.githubUsername) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username not configured'
      });
    }

    const githubUsername = user.githubUsername;

    // Fetch user profile from GitHub API
    let userResponse;
    try {
      userResponse = await axios.get(`https://api.github.com/users/${githubUsername}`, {
        headers: {
          'User-Agent': 'SAP-Skill-Analytics-Platform',
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 10000
      });
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'GitHub user not found'
        });
      }
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const userData = userResponse.data;

    // Fetch repositories
    let reposResponse;
    try {
      reposResponse = await axios.get(
        `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`,
        {
          headers: {
            'User-Agent': 'SAP-Skill-Analytics-Platform',
            'Accept': 'application/vnd.github.v3+json'
          },
          timeout: 15000
        }
      );
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }

    const repos = reposResponse.data || [];

    // Compute statistics
    let totalStars = 0;
    let totalForks = 0;
    const languagesCount = {};
    let lastActive = null;

    repos.forEach(repo => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;

      if (repo.language) {
        languagesCount[repo.language] = (languagesCount[repo.language] || 0) + 1;
      }

      if (repo.pushed_at) {
        const pushedDate = new Date(repo.pushed_at);
        if (!lastActive || pushedDate > lastActive) {
          lastActive = pushedDate;
        }
      }
    });

    // Convert languagesCount to array format
    const languages = Object.entries(languagesCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Get top 3 repos by stars
    const topRepos = repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 3)
      .map(repo => ({
        name: repo.name,
        description: repo.description || '',
        language: repo.language || null,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        htmlUrl: repo.html_url,
        updatedAt: repo.updated_at
      }));

    // Build response
    const response = {
      success: true,
      data: {
        profile: {
          name: userData.name || githubUsername,
          username: githubUsername,
          avatarUrl: userData.avatar_url || null,
          bio: userData.bio || null,
          publicRepos: userData.public_repos || 0,
          followers: userData.followers || 0,
          following: userData.following || 0,
          htmlUrl: userData.html_url || `https://github.com/${githubUsername}`
        },
        summary: {
          totalStars,
          totalForks,
          lastActive: lastActive ? lastActive.toISOString() : null
        },
        languages,
        topRepos
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    
    // Return 502 for GitHub API failures
    if (error.message.includes('GitHub API') || error.message.includes('Failed to fetch')) {
      return res.status(502).json({
        success: false,
        message: 'Failed to fetch data from GitHub API. Please try again later.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub stats',
      error: error.message
    });
  }
};

module.exports = {
  getGithubProfile,
  updateGithubProfile,
  getGithubStats
};

