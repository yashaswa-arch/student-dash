const Contest = require('../models/Contest');
const { fetchAllContestsFromAggregator, normalizeContest } = require('./contestAggregatorService');

/**
 * Refresh contests from external aggregator and cache in MongoDB
 * @returns {Promise<{upserted: number}>}
 */
async function refreshContestsFromAggregator() {
  try {
    console.log('Starting contest refresh from aggregator...');
    
    // Fetch raw contests from aggregator
    const rawContests = await fetchAllContestsFromAggregator();
    console.log(`Fetched ${rawContests.length} raw contests from aggregator`);
    
    // Normalize and filter contests
    const normalized = rawContests
      .map(normalizeContest)
      .filter(c => c.name && c.url);
    
    console.log(`Normalized ${normalized.length} contests`);
    
    let upserted = 0;
    
    // Upsert each contest into MongoDB
    for (const c of normalized) {
      try {
        await Contest.findOneAndUpdate(
          { externalId: c.externalId, platform: c.platform },
          { 
            ...c, 
            lastSyncedAt: new Date() 
          },
          { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true 
          }
        );
        upserted++;
      } catch (error) {
        console.error(`Error upserting contest ${c.name}:`, error.message);
        // Continue with next contest
      }
    }
    
    // Optional: delete very old contests (e.g. ended > 90 days ago)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const deleteResult = await Contest.deleteMany({ 
      endTime: { $lt: cutoff } 
    });
    
    const deletedCount = deleteResult.deletedCount || 0;
    
    console.log(`Contest refresh completed: ${upserted} upserted, ${deletedCount} old contests deleted`);
    
    return { upserted, deletedCount };
  } catch (error) {
    console.error('Error refreshing contests from aggregator:', error);
    throw new Error(`Failed to refresh contests: ${error.message}`);
  }
}

module.exports = { refreshContestsFromAggregator };
