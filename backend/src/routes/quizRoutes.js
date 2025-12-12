const express = require('express');
const Quiz = require('../models/Quiz');
const Video = require('../models/Video');
const { auth } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Optional helper to fetch YouTube transcript. We'll try using `youtube-transcript` library if available.
// If not available, generator will return an error instructing admin to supply transcript or enable captions.
let fetchYouTubeTranscript;
try {
  // dynamic require to avoid hard error if package not installed
  // Cursor should add `youtube-transcript` to backend/package.json dependencies
  // If not installed, this will throw and fallback to null
  const ytTranscript = require('youtube-transcript');
  fetchYouTubeTranscript = async (videoId) => {
    const list = await ytTranscript.fetchTranscript(videoId);
    // join text parts
    return list.map(p => p.text).join(' ');
  };
} catch (e) {
  console.warn('youtube-transcript package not available. Install with: npm install youtube-transcript');
  fetchYouTubeTranscript = null;
}

/* Gemini call helper:
   - Reads GEMINI_API_KEY from process.env (falls back to GOOGLE_API_KEY for compatibility).
   - Expected GEMINI_MODEL env var optional (fallback: 'gemini-1.5-pro')
   - Uses @google/generative-ai SDK which is already installed
*/
async function callGeminiGenerate(prompt, temperature = 0.2) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY not set in environment');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 512,
      }
    });
    
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
}

const router = express.Router();

/**
 * GET /api/video-lectures/quizzes/:videoId
 * Returns quizzes for the given videoId (video.videoId or mongo id depending on your system)
 * Public or protected? We'll make it public for playability; you can add auth if desired.
 */
router.get('/quizzes/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    // Query by videoId OR by video's mongo _id
    const q = { videoId };
    // fallback: if no quiz found, try lookup by video mongo _id's videoId field
    let list = await Quiz.find(q).lean();
    if ((!list || list.length === 0) && videoId.match && videoId.length > 16) {
      // maybe this is mongo id; find Video and query by its videoId
      const videoDoc = await Video.findById(videoId).lean();
      if (videoDoc && videoDoc.videoId) {
        list = await Quiz.find({ videoId: videoDoc.videoId }).lean();
      }
    }
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('GET quizzes error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/video-lectures/quizzes/submit
 * Body: { quizId, selectedIndex, videoTimestamp, responseTime?, attemptedSkip?, videoId? }
 * Requires auth (user must be logged) — we will require auth here.
 */
router.post('/quizzes/submit', auth, async (req, res) => {
  try {
    const { quizId, selectedIndex, videoTimestamp, responseTime = 0, attemptedSkip = false, videoId } = req.body;
    // For now, we just log the attempt. In production you should save attempts in DB (e.g. QuizAttempt model).
    console.log('Quiz submit', { user: req.user?.userId || req.user?._id, quizId, selectedIndex, videoTimestamp, attemptedSkip, videoId, responseTime });
    // Optionally check correctness if quiz.correctIndex present:
    let correct = null;
    if (quizId) {
      const q = await Quiz.findById(quizId).lean();
      if (q && typeof q.correctIndex === 'number') {
        correct = q.correctIndex === selectedIndex;
      }
    }
    return res.json({ success: true, data: { correct }});
  } catch (err) {
    console.error('submit quiz err', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/video-lectures/video/:id/generate-quizzes
 * Protected: require auth (admin recommended) — uses Gemini to create MCQs for a video.
 * Body optional: { numQuizzes = 6, startOffset = 30, endOffset = 30, segments?: [ { start, end } ] }
 *
 * Behavior:
 * - Fetch video by mongo id (or use videoId if provided).
 * - Attempt to fetch transcript via youtube-transcript package (if available).
 * - If segments provided, use those text slices; else split transcript into numQuizzes segments evenly.
 * - For each segment, call Gemini with a prompt to generate 1 MCQ (question + 4 options + correct index).
 * - Save generated quizzes to Quiz collection with timestamps.
 */
router.post('/video/:id/generate-quizzes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { numQuizzes = 6, startOffset = 30, endOffset = 30, segments = null } = req.body || {};
    // check admin role if your auth attaches role
    // if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    // find video
    const video = await Video.findById(id).lean();
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    // get transcript text
    let transcriptText = null;
    const videoIdForTranscript = video.videoId || (video.src && video.src.match(/(?:v=|youtu\.be\/|\/embed\/|watch\?v=)?([A-Za-z0-9_-]{11})/)?.[1]);
    
    if (fetchYouTubeTranscript && videoIdForTranscript) {
      try {
        transcriptText = await fetchYouTubeTranscript(videoIdForTranscript);
        console.log(`Fetched transcript (${transcriptText.length} chars) for video ${videoIdForTranscript}`);
      } catch (e) {
        console.warn('transcript fetch failed', e.message);
      }
    }

    if (!transcriptText && !segments) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transcript not available. Provide segments in request body or enable youtube-transcript dependency. Install with: npm install youtube-transcript' 
      });
    }

    // Build segments: if segments provided use them; else split transcript into approx equal chunks
    let chunks = [];
    if (segments && Array.isArray(segments) && segments.length > 0) {
      chunks = segments.map(s => ({ start: s.start, end: s.end, text: s.text }));
    } else {
      // simple split by words into numQuizzes parts
      const words = transcriptText.split(/\s+/);
      const chunkSize = Math.ceil(words.length / numQuizzes);
      for (let i = 0; i < numQuizzes; i++) {
        const partWords = words.slice(i * chunkSize, (i + 1) * chunkSize);
        const text = partWords.join(' ');
        // approximate timestamp positions: evenly spaced between startOffset and duration-endOffset if duration available
        const approxTs = video.durationSeconds 
          ? Math.round(startOffset + ((video.durationSeconds - startOffset - endOffset) * (i + 0.5) / numQuizzes)) 
          : Math.round(startOffset + i * 30);
        chunks.push({ start: approxTs, end: approxTs + 10, text });
      }
    }

    // Generate MCQs using Gemini for each chunk
    const generated = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const prompt = `
You are an expert instructor. Create one multiple-choice question (MCQ) with 4 answer options about the following lecture segment. Make the question directly test comprehension of the segment. Provide the correct option index (0-3).
Segment text:
"""${c.text}
"""
Respond in JSON only with fields: question, options (array of 4 strings), correctIndex (number).
Example response:
{
  "question": "What is the main topic discussed?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0
}
`;
      let genText;
      try {
        genText = await callGeminiGenerate(prompt, 0.1);
      } catch (e) {
        console.error('Gemini generation error', e);
        return res.status(500).json({ success: false, message: 'Gemini generation failed', detail: String(e) });
      }

      // try to parse JSON from genText
      let parsed;
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = genText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || genText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          parsed = JSON.parse(genText);
        }
      } catch (e) {
        // fallback: try to extract JSON substring
        const m = genText.match(/(\{[\s\S]*\})/);
        if (m) {
          try {
            parsed = JSON.parse(m[1]);
          } catch (parseErr) {
            console.warn('Could not parse gemini output, saving raw output', genText);
            parsed = { question: genText.slice(0, 200), options: [], correctIndex: null };
          }
        } else {
          console.warn('Could not parse gemini output, saving raw output', genText);
          parsed = { question: genText.slice(0, 200), options: [], correctIndex: null };
        }
      }

      const quizDoc = await Quiz.create({
        videoId: video.videoId || (video._id && video._id.toString()),
        timestamp: c.start || Math.round((video.durationSeconds || 0) * (i + 0.5) / chunks.length),
        question: parsed.question || parsed.q || 'Question',
        options: parsed.options && parsed.options.length ? parsed.options : (parsed.choices || []).slice(0, 4),
        correctIndex: typeof parsed.correctIndex === 'number' ? parsed.correctIndex : null,
        meta: { sourceTextPreview: c.text ? c.text.slice(0, 400) : null, generatedRaw: genText }
      });

      generated.push(quizDoc);
    }

    return res.json({ success: true, data: generated });
  } catch (err) {
    console.error('generate quizzes err', err);
    return res.status(500).json({ success: false, message: 'Server error', detail: err.message });
  }
});

module.exports = router;

