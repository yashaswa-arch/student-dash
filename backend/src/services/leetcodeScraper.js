const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape LeetCode problem details from URL
 * @param {string} url - LeetCode problem URL
 * @returns {object} - Problem details {title, description, difficulty}
 */
async function scrapeLeetCodeProblem(url) {
  try {
    // Extract problem slug from URL
    const match = url.match(/leetcode\.com\/problems\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid LeetCode URL format');
    }
    
    const problemSlug = match[1];
    
    // Make request to LeetCode (using GraphQL API - more reliable than scraping)
    const graphqlQuery = {
      query: `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            content
            difficulty
          }
        }
      `,
      variables: {
        titleSlug: problemSlug
      }
    };
    
    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const question = response.data.data.question;
    
    if (!question) {
      throw new Error('Problem not found');
    }
    
    // Clean HTML from description
    const $ = cheerio.load(question.content);
    const cleanDescription = $.text().trim();
    
    return {
      title: question.title,
      description: cleanDescription,
      difficulty: question.difficulty
    };
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    
    // Fallback: Try basic scraping
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Try to extract from meta tags or title
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('title').text().split('-')[0].trim();
      
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || 
                         'Could not fetch description';
      
      // Try to find difficulty
      let difficulty = 'Medium';
      const difficultyText = $.text().toLowerCase();
      if (difficultyText.includes('difficulty: easy')) difficulty = 'Easy';
      else if (difficultyText.includes('difficulty: hard')) difficulty = 'Hard';
      
      return {
        title: title || 'Unknown Problem',
        description,
        difficulty
      };
      
    } catch (fallbackError) {
      throw new Error('Could not fetch problem from LeetCode. Please check URL or try again.');
    }
  }
}

module.exports = { scrapeLeetCodeProblem };
