const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const PracticeSubmission = require('../models/PracticeSubmission');
const mongoose = require('mongoose');

/**
 * GET /api/student/overview
 * Get comprehensive student overview including streak, solved problems, practice time, etc.
 * 
 * Streak Calculation Logic:
 * - Only PASSED submissions count towards streaks
 * - Current streak: Consecutive days from most recent date backwards
 *   - Only counts if most recent solved date was today or yesterday (within 1 day)
 *   - Counts backwards day by day until a gap is found
 * - Example: If solved today, yesterday, day before → streak = 3
 * - If last solved was 2 days ago → streak = 0 (broken)
 */
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate total solved (only PASSED submissions)
    const totalSolvedResult = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: userId,
          verdict: 'PASSED'
        }
      },
      {
        $group: {
          _id: null,
          totalSolved: { $sum: 1 }
        }
      }
    ]);
    const totalSolved = totalSolvedResult[0]?.totalSolved || 0;

    // Calculate practice minutes today
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const practiceTodayResult = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: {
            $sum: {
              $cond: [
                { $ifNull: ['$timeTakenInMinutes', false] },
                '$timeTakenInMinutes',
                5 // Default 5 minutes per submission if no time recorded
              ]
            }
          },
          submissionCount: { $sum: 1 }
        }
      }
    ]);
    // If no timeTakenInMinutes, estimate based on submission count
    const practiceMinutesToday = practiceTodayResult[0]?.totalMinutes 
      ? Math.round(practiceTodayResult[0].totalMinutes)
      : (practiceTodayResult[0]?.submissionCount || 0) * 5;

    // Calculate current streak
    // Get all PASSED submissions grouped by date
    const solvedByDate = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: userId,
          verdict: 'PASSED'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          solvedCount: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } } // Most recent first
    ]);

    let currentStreakDays = 0;
    
    if (solvedByDate.length > 0) {
      // Get unique dates (most recent first)
      const uniqueDates = [...new Set(solvedByDate.map(d => d._id))].sort().reverse();
      
      // Get the most recent solved date
      const mostRecentDate = new Date(uniqueDates[0] + 'T00:00:00');
      const daysSinceMostRecent = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
      
      // Only count streak if most recent was today or yesterday (within 1 day)
      if (daysSinceMostRecent <= 1) {
        let checkDate = new Date(mostRecentDate);
        let consecutiveDays = 0;
        
        // Count backwards from most recent date
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates.includes(dateStr)) {
            consecutiveDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break; // Gap found, stop counting
          }
        }
        
        currentStreakDays = consecutiveDays;
      }
    }

    // Get recent submissions (last 20, newest first)
    const recentSubmissions = await PracticeSubmission.find({ userId: userId })
      .populate('questionId', 'title topic difficulty')
      .sort({ createdAt: -1 })
      .limit(20)
      .select('questionTitle questionId source status verdict createdAt')
      .lean();

    // Format recent submissions
    const formattedSubmissions = recentSubmissions.map(sub => ({
      _id: sub._id,
      problemTitle: sub.questionTitle || sub.questionId?.title || 'Unknown Problem',
      platform: sub.source || 'quick-practice',
      status: sub.verdict === 'PASSED' ? 'AC' : sub.verdict || sub.status || 'Unknown',
      result: sub.verdict,
      timestamp: sub.createdAt,
      submittedAt: sub.createdAt,
      createdAt: sub.createdAt
    }));

    // Get upcoming interview (placeholder - can be extended)
    const upcomingInterview = null; // TODO: Implement interview scheduling logic

    // Calculate efficiency metrics
    const efficiencyResult = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: userId,
          verdict: 'PASSED'
        }
      },
      {
        $group: {
          _id: '$questionId',
          attempts: { $sum: 1 },
          firstSolved: { $min: '$createdAt' }
        }
      }
    ]);

    const avgAttemptsPerSolved = efficiencyResult.length > 0
      ? efficiencyResult.reduce((sum, q) => sum + q.attempts, 0) / efficiencyResult.length
      : 0;

    // Find fastest solve (minimum time taken for PASSED submissions)
    const fastestSolve = await PracticeSubmission.findOne({
      userId: userId,
      verdict: 'PASSED',
      timeTakenInMinutes: { $exists: true, $ne: null }
    })
      .sort({ timeTakenInMinutes: 1 })
      .select('timeTakenInMinutes')
      .lean();

    const fastestSolveMins = fastestSolve?.timeTakenInMinutes || null;

    res.json({
      totalSolved,
      currentStreakDays,
      practiceMinutesToday,
      efficiency: {
        avgAttemptsPerSolved: Math.round(avgAttemptsPerSolved * 100) / 100,
        fastestSolveMins
      },
      upcomingInterview,
      recentSubmissions: formattedSubmissions
    });

  } catch (error) {
    console.error('Error fetching student overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student overview',
      error: error.message
    });
  }
});

module.exports = router;

