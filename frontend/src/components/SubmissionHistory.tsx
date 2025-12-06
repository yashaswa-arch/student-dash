import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle,
  XCircle,
  Code,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import api from '../api/axios';

interface Submission {
  _id: string;
  code: string;
  language: string;
  status: string;
  testCasesPassed: number;
  totalTestCases: number;
  aiAnalysis: {
    analysisSummary?: string;
    approachDetected?: string;
    correctness?: boolean;
    timeComplexity?: string;
    spaceComplexity?: string;
    score?: number;
    mindsetCoaching?: string;
  };
  submittedAt: string;
  executionTime?: number;
  memoryUsed?: number;
}

interface Props {
  submissions?: Submission[];
  onViewDetails?: (submission: Submission) => void;
  questionId?: string;
}

const SubmissionHistory: React.FC<Props> = ({ submissions: propSubmissions, onViewDetails, questionId }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(propSubmissions || []);
  const [loading, setLoading] = useState(!!questionId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');

  useEffect(() => {
    if (questionId) {
      fetchSubmissions();
    } else if (propSubmissions) {
      setSubmissions(propSubmissions);
    }
  }, [questionId, propSubmissions]);

  const fetchSubmissions = async () => {
    if (!questionId) return;
    try {
      setLoading(true);
      const response = await api.get(`/submissions/list`, {
        params: { questionId }
      });
      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission: Submission) => {
    if (onViewDetails) {
      onViewDetails(submission);
    } else {
      // Default behavior: expand/collapse
      setExpandedId(expandedId === submission._id ? null : submission._id);
    }
  };

  const filteredSubmissions = submissions
    .filter(sub => {
      if (filter === 'all') return true;
      if (filter === 'passed') return sub.status === 'passed';
      if (filter === 'failed') return sub.status !== 'passed';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      return (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0);
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'runtime_error': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'passed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Passed ({submissions.filter(s => s.status === 'passed').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'failed' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Failed ({submissions.filter(s => s.status !== 'passed').length})
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'score')}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
        >
          <option value="recent">Most Recent</option>
          <option value="score">Highest Score</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Code className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No submissions yet</p>
          </div>
        ) : (
          filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              {/* Summary Row */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === submission._id ? null : submission._id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  {submission.status === 'passed' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {submission.language}
                      </span>
                      {submission.aiAnalysis?.approachDetected && (
                        <span className="text-sm text-gray-600">
                          {submission.aiAnalysis.approachDetected}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div>
                        Tests: {submission.testCasesPassed}/{submission.totalTestCases}
                      </div>
                      {submission.aiAnalysis?.timeComplexity && (
                        <div>
                          Time: {submission.aiAnalysis.timeComplexity}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  {submission.aiAnalysis?.score !== undefined && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(submission.aiAnalysis.score)}`}>
                        {submission.aiAnalysis.score}
                      </div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                  )}

                  {/* Expand Icon */}
                  {expandedId === submission._id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === submission._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 bg-gray-50"
                  >
                    <div className="p-4 space-y-4">
                      {/* Complexity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Time Complexity</div>
                          <div className="font-medium text-purple-600">
                            {submission.aiAnalysis?.timeComplexity || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Space Complexity</div>
                          <div className="font-medium text-purple-600">
                            {submission.aiAnalysis?.spaceComplexity || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Analysis Summary */}
                      {submission.aiAnalysis?.analysisSummary && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Analysis</div>
                          <div className="text-sm text-gray-800">
                            {submission.aiAnalysis.analysisSummary}
                          </div>
                        </div>
                      )}

                      {/* Mindset Coaching */}
                      {submission.aiAnalysis?.mindsetCoaching && (
                        <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-purple-900 mb-1">Mentor's Note</div>
                          <div className="text-sm text-purple-800 italic">
                            "{submission.aiAnalysis.mindsetCoaching}"
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {onViewDetails && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(submission)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            View Full Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;
