const express = require('express');
const router = express.Router();
const { adminAuth, auth } = require('../middleware/auth');
const videoController = require('../controllers/videoLectureController');

// Verify controller loaded correctly
if (!videoController || typeof videoController.getTopics !== 'function') {
  console.error('ERROR: videoLectureController did not load correctly');
  console.error('Controller keys:', videoController ? Object.keys(videoController) : 'null');
  throw new Error('videoLectureController failed to load - check for syntax errors');
}

router.get('/topics', videoController.getTopics);
router.get('/series', videoController.getSeries);
router.get('/series/:seriesId/info', videoController.getSeriesInfo);
router.get('/series/:seriesId', videoController.getSeriesVideos);
router.get('/', videoController.listVideos);
router.post('/topics', adminAuth, videoController.createTopic);
router.put('/topics/:id', adminAuth, videoController.updateTopic);
router.delete('/topics/:id', adminAuth, videoController.deleteTopic);
router.post('/series', adminAuth, videoController.createSeries);
router.put('/series/:id', adminAuth, videoController.updateSeries);
router.delete('/series/:id', adminAuth, videoController.deleteSeries);
router.post('/extract-metadata', adminAuth, videoController.extractMetadata);
router.post('/migrate-src', adminAuth, videoController.migrateSrc);
router.get('/videos', adminAuth, videoController.getVideos);
router.post('/videos', adminAuth, videoController.createVideo);
router.put('/videos/:id', adminAuth, videoController.updateVideo);
router.delete('/videos/:id', adminAuth, videoController.deleteVideo);
router.post('/videos/:id/timestamps', adminAuth, videoController.setTimestamps);
router.get('/quizzes/:videoId', videoController.getVideoQuizzes);
router.post('/quizzes/submit', auth, videoController.submitQuiz);
router.post('/:videoId/generate-quizzes', adminAuth, videoController.generateQuizzes);
router.post('/:videoId/auto-timestamps', adminAuth, videoController.autoTimestamps);
router.get('/:videoId', videoController.getVideo);

module.exports = router;