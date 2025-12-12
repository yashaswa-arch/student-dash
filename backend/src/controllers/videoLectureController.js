const Topic = require('../models/Topic');
const Series = require('../models/Series');
const Video = require('../models/Video');
const VideoQuiz = require('../models/VideoQuiz');
const QuizAttempt = require('../models/QuizAttempt');
const PresenceSummary = require('../models/PresenceSummary');
const axios = require('axios');
const { initializeGemini, generateQuizWithGemini, buildSegmentSummary, formatTimestamp, shouldPublishQuiz } = require('../services/geminiQuizService');
const { normalizeVideoURL } = require('../utils/normalizeVideo');

const extractYouTubeId = (url) => {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/v\/([^&\n?#]+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractVimeoId = (url) => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
};

const getYouTubeMetadata = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { videoId, thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` };
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', { params: { id: videoId, part: 'snippet,contentDetails', key: apiKey } });
    if (response.data.items && response.data.items.length > 0) {
      const item = response.data.items[0];
      const snippet = item.snippet;
      const contentDetails = item.contentDetails;
      let durationSeconds = null;
      if (contentDetails.duration) {
        const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || 0);
          const minutes = parseInt(match[2] || 0);
          const seconds = parseInt(match[3] || 0);
          durationSeconds = hours * 3600 + minutes * 60 + seconds;
        }
      }
      return { videoId, provider: 'youtube', thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, durationSeconds };
    }
  } catch (error) {
    console.error('YouTube API error:', error.message);
  }
  return { videoId, thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` };
};

const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ isActive: true }).select('_id name slug').sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTopic = async (req, res) => {
  try {
    const { name, description, order } = req.body;
    const topic = new Topic({ name, description, order });
    await topic.save();
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Topic name already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSeries = async (req, res) => {
  try {
    const query = { isPublished: true };
    if (req.query.topic) query.topic = req.query.topic;
    const series = await Series.find(query).select('_id topic title description thumbnail').populate('topic', '_id name').sort({ order: 1, createdAt: -1 });
    const transformedSeries = series.map(s => ({ _id: s._id, topicId: s.topic?._id || s.topic, title: s.title, description: s.description, thumbnail: s.thumbnail }));
    res.json({ success: true, data: transformedSeries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSeriesVideos = async (req, res) => {
  try {
    const { seriesId } = req.params;
    console.log('getSeriesVideos called with seriesId:', seriesId);
    const videos = await Video.find({ series: seriesId, isPublished: true }).select('_id title description thumbnail durationSeconds order').sort({ order: 1, createdAt: -1 });
    console.log(`Found ${videos.length} published videos for series ${seriesId}`);
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'Server error fetching videos' });
  }
};

const getSeriesInfo = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const series = await Series.findById(seriesId).populate('topic', '_id name');
    if (!series) return res.status(404).json({ success: false, message: 'Series not found' });
    res.json({ success: true, data: series });
  } catch (error) {
    console.error('Error fetching series info:', error);
    res.status(500).json({ success: false, message: 'Server error fetching series info' });
  }
};

const createSeries = async (req, res) => {
  try {
    const series = new Series(req.body);
    await series.save();
    await series.populate('topic');
    res.status(201).json({ success: true, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSeries = async (req, res) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('topic');
    if (!series) return res.status(404).json({ success: false, message: 'Series not found' });
    res.json({ success: true, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ success: false, message: 'Series not found' });
    res.json({ success: true, message: 'Series deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listVideos = async (req, res) => {
  try {
    const query = { isPublished: true };
    if (req.query.seriesId) query.series = req.query.seriesId;
    const videos = await Video.find(query).populate('series', '_id title').select('_id title description thumbnail durationSeconds series order').sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVideos = async (req, res) => {
  try {
    const query = {};
    if (req.query.series) query.series = req.query.series;
    const videos = await Video.find(query).populate('series').sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    let video = await Video.findById(videoId).populate('series');
    if (!video) video = await Video.findOne({ videoId: videoId }).populate('series');
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    const normalized = normalizeVideoURL(video.src);
    const finalSrc = normalized.src || `https://www.youtube.com/watch?v=${normalized.videoId || video.videoId || ''}`;
    if (normalized.src && normalized.src !== video.src && video.provider === 'youtube') {
      video.src = normalized.src;
      if (normalized.videoId && !video.videoId) video.videoId = normalized.videoId;
      await video.save();
    }
    res.json({ success: true, videoId: video.videoId || video._id.toString(), title: video.title, src: finalSrc, thumbnail: video.thumbnail, provider: video.provider || 'youtube', durationSeconds: video.durationSeconds || null, segmentTimestamps: video.segmentTimestamps || [] });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createVideo = async (req, res) => {
  try {
    if (req.body.src) {
      const normalized = normalizeVideoURL(req.body.src);
      if (!normalized.videoId) return res.status(400).json({ success: false, message: 'Invalid YouTube URL. Could not extract video ID.' });
      req.body.src = normalized.src;
      req.body.videoId = normalized.videoId;
      if (!req.body.provider) req.body.provider = 'youtube';
    }
    const video = new Video(req.body);
    await video.save();
    await video.populate('series');
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    if (req.body.src) {
      const normalized = normalizeVideoURL(req.body.src);
      if (normalized.videoId) {
        req.body.src = normalized.src;
        req.body.videoId = normalized.videoId;
      }
    }
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('series');
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setTimestamps = async (req, res) => {
  try {
    const { segmentTimestamps } = req.body;
    const video = await Video.findByIdAndUpdate(req.params.id, { segmentTimestamps }, { new: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVideoQuizzes = async (req, res) => {
  try {
    const quizzes = await VideoQuiz.find({ video: req.params.videoId, isPublished: true }).sort({ timestamp: 1 });
    const sanitizedQuizzes = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      delete quizObj.correctIndex;
      return quizObj;
    });
    res.json({ success: true, data: sanitizedQuizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, selectedIndex, videoTimestamp } = req.body;
    const userId = req.user._id;
    const quiz = await VideoQuiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    const isCorrect = selectedIndex === quiz.correctIndex;
    const attempt = new QuizAttempt({ user: userId, quiz: quizId, video: quiz.video, selectedIndex, isCorrect, videoTimestamp });
    await attempt.save();
    let summary = await PresenceSummary.findOne({ user: userId, video: quiz.video });
    if (!summary) summary = new PresenceSummary({ user: userId, video: quiz.video });
    summary.quizzesAnswered += 1;
    if (isCorrect) summary.quizzesCorrect += 1;
    summary.calculatePresenceScore();
    await summary.save();
    res.json({ success: true, ok: true, isCorrect, summary: { quizzesAnswered: summary.quizzesAnswered, quizzesCorrect: summary.quizzesCorrect, presenceScore: summary.presenceScore } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const autoTimestamps = async (req, res) => {
  try {
    const { numQuizzes, startOffset = 60, endOffset = 60 } = req.body;
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (!video.durationSeconds) return res.status(400).json({ success: false, message: 'Video duration is not set. Please extract metadata first.' });
    const availableDuration = video.durationSeconds - startOffset - endOffset;
    if (availableDuration <= 0) return res.status(400).json({ success: false, message: 'Invalid duration or offsets. Available duration must be positive.' });
    const timestamps = [];
    if (numQuizzes > 0) {
      const interval = availableDuration / (numQuizzes + 1);
      for (let i = 1; i <= numQuizzes; i++) {
        timestamps.push(Math.round(startOffset + (interval * i)));
      }
    }
    res.json({ success: true, data: { timestamps, durationSeconds: video.durationSeconds, numQuizzes, startOffset, endOffset } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const extractMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
    let videoId = null, provider = 'youtube', thumbnail = null, durationSeconds = null;
    const normalized = normalizeVideoURL(url);
    if (normalized.videoId) {
      videoId = normalized.videoId;
      provider = 'youtube';
      const metadata = await getYouTubeMetadata(normalized.videoId);
      thumbnail = metadata.thumbnail;
      durationSeconds = metadata.durationSeconds;
    } else {
      const vimeoId = extractVimeoId(url);
      if (vimeoId) {
        videoId = vimeoId;
        provider = 'vimeo';
        thumbnail = `https://vumbnail.com/${vimeoId}.jpg`;
      } else {
        provider = 'custom';
      }
    }
    res.json({ success: true, data: { videoId, provider, thumbnail, durationSeconds, src: normalized.src || url } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateQuizzes = async (req, res) => {
  try {
    if (!process.env.GOOGLE_API_KEY) return res.status(400).json({ success: false, message: 'GOOGLE_API_KEY is not set in environment variables. Please set it in .env file before running.' });
    try {
      initializeGemini();
    } catch (error) {
      return res.status(500).json({ success: false, message: `Failed to initialize Gemini: ${error.message}` });
    }
    let video = await Video.findById(req.params.videoId).populate('series');
    if (!video) {
      video = await Video.findOne({ videoId: req.params.videoId }).populate('series');
      if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    }
    if (!video.segmentTimestamps || video.segmentTimestamps.length === 0) return res.status(400).json({ success: false, message: 'Video has no segment timestamps. Please set timestamps first.' });
    const series = await Series.findById(video.series).populate('topic');
    const topic = series?.topic?.name || 'Arrays';
    const subtopic = null;
    console.log(`📝 Generating quizzes for video: ${video.title}`);
    console.log(`📊 Found ${video.segmentTimestamps.length} segment timestamps`);
    const results = { total: video.segmentTimestamps.length, generated: 0, failed: 0, published: 0, unpublished: 0, quizzes: [] };
    for (const timestamp of video.segmentTimestamps) {
      try {
        console.log(`\n⏱️  Generating quiz for timestamp: ${formatTimestamp(timestamp)}`);
        const segmentSummary = buildSegmentSummary(timestamp, subtopic);
        console.log(`📋 Segment summary: ${segmentSummary}`);
        const quizData = await generateQuizWithGemini(topic, subtopic, segmentSummary);
        const shouldPublish = await shouldPublishQuiz(segmentSummary, quizData.question_text, quizData.confidence);
        const existingQuiz = await VideoQuiz.findOne({ video: video._id, timestamp: timestamp });
        let quiz;
        if (existingQuiz) {
          existingQuiz.question = quizData.question_text;
          existingQuiz.options = quizData.options;
          existingQuiz.correctIndex = quizData.correct_option_index;
          existingQuiz.explanation = quizData.explanation || '';
          existingQuiz.difficulty = quizData.difficulty;
          existingQuiz.confidence = quizData.confidence;
          existingQuiz.isPublished = shouldPublish;
          await existingQuiz.save();
          quiz = existingQuiz;
          console.log(`✅ Updated existing quiz`);
        } else {
          quiz = new VideoQuiz({ video: video._id, timestamp: timestamp, question: quizData.question_text, options: quizData.options, correctIndex: quizData.correct_option_index, explanation: quizData.explanation || '', difficulty: quizData.difficulty, confidence: quizData.confidence, isPublished: shouldPublish });
          await quiz.save();
          console.log(`✅ Created new quiz`);
        }
        results.generated++;
        if (shouldPublish) results.published++;
        else results.unpublished++;
        results.quizzes.push({ timestamp: timestamp, timestampFormatted: formatTimestamp(timestamp), question: quiz.question, difficulty: quiz.difficulty, confidence: quiz.confidence, isPublished: quiz.isPublished, quizId: quiz._id });
        console.log(`   Question: ${quiz.question.substring(0, 60)}...`);
        console.log(`   Difficulty: ${quiz.difficulty}, Confidence: ${quiz.confidence.toFixed(2)}`);
        console.log(`   Published: ${quiz.isPublished ? '✅' : '❌'}`);
      } catch (error) {
        console.error(`❌ Failed to generate quiz for timestamp ${timestamp}:`, error.message);
        results.failed++;
        results.quizzes.push({ timestamp: timestamp, timestampFormatted: formatTimestamp(timestamp), error: error.message });
      }
    }
    console.log('\n📊 Generation Summary:');
    console.log(`   Total: ${results.total}`);
    console.log(`   Generated: ${results.generated}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Published: ${results.published}`);
    console.log(`   Unpublished: ${results.unpublished}`);
    res.json({ success: true, message: `Generated ${results.generated} quizzes (${results.published} published, ${results.unpublished} unpublished)`, summary: { total: results.total, generated: results.generated, failed: results.failed, published: results.published, unpublished: results.unpublished }, quizzes: results.quizzes });
  } catch (error) {
    console.error('❌ Error generating quizzes:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate quizzes' });
  }
};

const migrateSrc = async (req, res) => {
  try {
    const videos = await Video.find({ provider: 'youtube' });
    let updated = 0;
    for (const video of videos) {
      const normalized = normalizeVideoURL(video.src);
      if (normalized.src && normalized.src !== video.src) {
        video.src = normalized.src;
        if (normalized.videoId && !video.videoId) video.videoId = normalized.videoId;
        await video.save();
        updated++;
      }
    }
    res.json({ success: true, message: `Migrated ${updated} of ${videos.length} videos` });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getSeries,
  getSeriesVideos,
  getSeriesInfo,
  createSeries,
  updateSeries,
  deleteSeries,
  listVideos,
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  setTimestamps,
  getVideoQuizzes,
  submitQuiz,
  autoTimestamps,
  extractMetadata,
  generateQuizzes,
  migrateSrc
};

