import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  BarChart3,
  GraduationCap,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface MentorFeedback {
  analysisSummary: string;
  approachDetected: string;
  correctness: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  nextProblemRecommendation: {
    topic: string;
    why: string;
  };
  mindsetCoaching: string;
  score?: number;
}

interface Props {
  feedback: MentorFeedback;
  testResults?: {
    passed: number;
    total: number;
  };
}

const MentorFeedbackPanel: React.FC<Props> = ({ feedback, testResults }) => {
  const {
    analysisSummary,
    approachDetected,
    correctness,
    timeComplexity,
    spaceComplexity,
    strengths,
    weaknesses,
    improvementSuggestions,
    nextProblemRecommendation,
    mindsetCoaching,
    score
  } = feedback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className={`rounded-xl border-2 p-6 ${
        correctness 
          ? 'border-green-500 bg-green-50' 
          : 'border-red-500 bg-red-50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {correctness ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <h3 className={`text-xl font-bold ${
                correctness ? 'text-green-900' : 'text-red-900'
              }`}>
                {correctness ? 'Solution Correct ✓' : 'Solution Incorrect ✗'}
              </h3>
              <p className={`text-sm ${
                correctness ? 'text-green-700' : 'text-red-700'
              }`}>
                Approach: {approachDetected}
              </p>
            </div>
          </div>
          
          {score !== undefined && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {score}
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className={`text-sm ${
            correctness ? 'text-green-800' : 'text-red-800'
          }`}>
            {analysisSummary}
          </p>
        </div>

        {testResults && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <span className="font-medium">Tests: </span>
            <span className={testResults.passed === testResults.total ? 'text-green-600' : 'text-red-600'}>
              {testResults.passed}/{testResults.total} passed
            </span>
          </div>
        )}
      </div>

      {/* Complexity Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Time Complexity</div>
          <div className="mt-2 text-2xl font-bold text-purple-600">{timeComplexity}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Space Complexity</div>
          <div className="mt-2 text-2xl font-bold text-purple-600">{spaceComplexity}</div>
        </div>
      </div>

      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-green-600" />
            <h4 className="text-lg font-semibold text-green-900">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-green-800"
              >
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses && weaknesses.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h4 className="text-lg font-semibold text-red-900">Weaknesses</h4>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-red-800"
              >
                <span className="text-red-600 mt-0.5">✗</span>
                <span>{weakness}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {improvementSuggestions && improvementSuggestions.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <h4 className="text-lg font-semibold text-yellow-900">Improvements</h4>
          </div>
          <ul className="space-y-3">
            {improvementSuggestions.map((suggestion, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 text-sm text-yellow-800"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 font-medium text-xs">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Problem Recommendation */}
      {nextProblemRecommendation && nextProblemRecommendation.topic && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h4 className="text-lg font-semibold text-blue-900">Next Challenge</h4>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="font-medium text-blue-900 mb-1">
                Topic: {nextProblemRecommendation.topic}
              </div>
              <div className="text-sm text-blue-700">
                {nextProblemRecommendation.why}
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Find Problems
            </button>
          </div>
        </div>
      )}

      {/* Mindset Coaching */}
      {mindsetCoaching && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm mb-1">Mentor's Note</div>
              <div className="text-lg font-semibold italic">
                "{mindsetCoaching}"
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MentorFeedbackPanel;
