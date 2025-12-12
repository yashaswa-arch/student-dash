const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/**
 * Gemini Quiz Generation Service
 * Generates MCQ quizzes for video segments using Google Gemini API
 */

// Initialize Gemini client
let genAI = null;
let isInitialized = false;

const initializeGemini = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }
  
  if (!isInitialized) {
    genAI = new GoogleGenerativeAI(apiKey);
    isInitialized = true;
  }
  
  return genAI;
};

/**
 * Format timestamp to MM:SS
 */
const formatTimestamp = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Build segment summary
 */
const buildSegmentSummary = (timestamp, subtopic = null) => {
  if (subtopic) {
    return `${subtopic} segment near ${formatTimestamp(timestamp)}`;
  }
  return `Arrays segment near ${formatTimestamp(timestamp)}`;
};

/**
 * Generate quiz using Gemini API
 */
const generateQuizWithGemini = async (topic, subtopic, segmentSummary, retries = 2) => {
  if (!isInitialized) {
    initializeGemini();
  }

  // Use available model (gemini-2.5-flash is fast and reliable)
  // Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-pro-latest
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName, temperature: 0.1 });

  const prompt = `You are a quiz generator. Topic: ${topic}. Subtopic: ${subtopic || 'N/A'}. Segment summary: ${segmentSummary}.
Produce EXACT JSON object:
{ "question_text":"...", "options":["...","...","...","..."], "correct_option_index":N, "difficulty":"easy|medium|hard", "explanation":"..." , "confidence":0-1 }`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const quizData = JSON.parse(jsonText);

      // Validate structure
      if (!quizData.question_text || !Array.isArray(quizData.options) || 
          quizData.options.length !== 4 || typeof quizData.correct_option_index !== 'number' ||
          !['easy', 'medium', 'hard'].includes(quizData.difficulty)) {
        throw new Error('Invalid quiz structure from Gemini');
      }

      // Ensure correct_option_index is within bounds
      if (quizData.correct_option_index < 0 || quizData.correct_option_index >= 4) {
        throw new Error('Invalid correct_option_index');
      }

      // Ensure confidence is between 0 and 1
      quizData.confidence = Math.max(0, Math.min(1, quizData.confidence || 0.5));

      return quizData;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to generate quiz after ${retries + 1} attempts: ${error.message}`);
      }
      console.log(`⚠️  Attempt ${attempt + 1} failed, retrying...`);
    }
  }
};

/**
 * Compute embeddings using a simple text embedding service
 * For production, use a proper embedding model (e.g., Google's text-embedding-004)
 * This is a simplified version that uses Gemini's embedding capabilities if available
 */
const computeEmbedding = async (text) => {
  // Simplified: For now, we'll use a basic text similarity approach
  // In production, you'd use Google's text-embedding-004 or similar
  // This is a placeholder that returns a simple hash-based vector
  // For actual implementation, you'd call an embedding API
  
  // For now, return null to skip similarity check
  // The optional similarity check can be implemented later with proper embedding service
  return null;
};

/**
 * Compute cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Determine if quiz should be published based on similarity and confidence
 * Optional: If embeddings are available, check similarity
 */
const shouldPublishQuiz = async (summary, question, confidence) => {
  // Optional similarity check (if embeddings are computed)
  // For now, we'll skip the embedding check and use confidence only
  // Uncomment below when embedding service is available
  
  /*
  const summaryEmbedding = await computeEmbedding(summary);
  const questionEmbedding = await computeEmbedding(question);
  
  if (summaryEmbedding && questionEmbedding) {
    const similarity = cosineSimilarity(summaryEmbedding, questionEmbedding);
    return similarity >= 0.62 && confidence >= 0.45;
  }
  */
  
  // For now, use confidence threshold only
  return confidence >= 0.45;
};

module.exports = {
  initializeGemini,
  generateQuizWithGemini,
  buildSegmentSummary,
  formatTimestamp,
  shouldPublishQuiz
};

