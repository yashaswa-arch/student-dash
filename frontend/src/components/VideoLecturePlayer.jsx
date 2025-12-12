import React, { useEffect, useRef, useState, useCallback } from "react";
import api from "../api/axios";
import { Loader } from "./SmallUIHelpers";
import { videoLectureAPI } from "../api/services";

export default function VideoLecturePlayer({ videoId, onPresenceUpdate }) {
  const [videoMeta, setVideoMeta] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ytPlayer, setYtPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const playerContainerRef = useRef(null);
  
  // Quiz-related state
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answeredQuizzes, setAnsweredQuizzes] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(60); // 1 minute timer
  const [presenceSummary, setPresenceSummary] = useState({
    quizzesAnswered: 0,
    quizzesCorrect: 0,
    quizzesUnanswered: 0,
    presenceScore: 0
  });

  // Progress tracking interval ref
  const progressIntervalRef = useRef(null);
  const pauseIntervalRef = useRef(null);
  const lastTimeRef = useRef(0);
  const seekCheckTimeoutRef = useRef(null);
  
  // Refs to always have latest quiz data in intervals
  const quizzesRef = useRef([]);
  const answeredQuizzesRef = useRef(new Set());
  const currentQuizRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const playerReadyRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => {
    quizzesRef.current = quizzes;
  }, [quizzes]);
  
  useEffect(() => {
    answeredQuizzesRef.current = answeredQuizzes;
  }, [answeredQuizzes]);
  
  useEffect(() => {
    currentQuizRef.current = currentQuiz;
  }, [currentQuiz]);
  
  useEffect(() => {
    ytPlayerRef.current = ytPlayer;
  }, [ytPlayer]);
  
  useEffect(() => {
    playerReadyRef.current = playerReady;
  }, [playerReady]);
  
  // Function to check for quiz at current time (used after seeking)
  // Using useCallback to make it stable and accessible in callbacks
  // Uses refs to ensure we have latest data
  const checkForQuizAtCurrentTime = useCallback(() => {
    const latestPlayer = ytPlayerRef.current;
    const latestReady = playerReadyRef.current;
    const latestQuizzes = quizzesRef.current;
    const latestCurrentQuiz = currentQuizRef.current;
    
    if (!latestPlayer || !latestReady || latestQuizzes.length === 0 || latestCurrentQuiz) {
      if (!latestPlayer) console.log('⚠️ checkForQuizAtCurrentTime: No player (using ref)');
      if (!latestReady) console.log('⚠️ checkForQuizAtCurrentTime: Player not ready (using ref)');
      if (latestQuizzes.length === 0) console.log('⚠️ checkForQuizAtCurrentTime: No quizzes (using ref)');
      if (latestCurrentQuiz) console.log('⚠️ checkForQuizAtCurrentTime: Quiz already showing (using ref)');
      return;
    }
    
    try {
      const time = latestPlayer.getCurrentTime();
      const newTime = Math.floor(time);
      
      console.log('🔍 Checking for quiz at time:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ')');
      console.log('📋 Available quizzes:', latestQuizzes.map(q => ({
        id: q._id,
        timestamp: q.timestamp,
        timeFormatted: `${Math.floor(q.timestamp/60)}:${(q.timestamp%60).toString().padStart(2,'0')}`,
        answered: answeredQuizzesRef.current.has(q._id)
      })));
      
      // Check for quiz with wider tolerance when user seeks (10 seconds instead of 2)
      const matchingQuiz = latestQuizzes.find(q => {
        const quizTime = Math.floor(q.timestamp);
        const timeDiff = Math.abs(quizTime - newTime);
        const isMatch = !answeredQuizzesRef.current.has(q._id) && timeDiff <= 10; // Very wide tolerance for seeks
        
        if (timeDiff <= 15) {
          console.log('🔍 Quiz candidate:', {
            quizTime,
            quizTimeFormatted: `${Math.floor(quizTime/60)}:${(quizTime%60).toString().padStart(2,'0')}`,
            currentTime: newTime,
            currentTimeFormatted: `${Math.floor(newTime/60)}:${(newTime%60).toString().padStart(2,'0')}`,
            timeDiff,
            isMatch,
            answered: answeredQuizzes.has(q._id)
          });
        }
        
        return isMatch;
      });
      
      if (matchingQuiz) {
        console.log('🛑🛑🛑🛑🛑 TRIGGERING QUIZ AFTER SEEK! 🛑🛑🛑🛑🛑');
        console.log('Time:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ')');
        console.log('Quiz timestamp:', matchingQuiz.timestamp, 'seconds (', Math.floor(matchingQuiz.timestamp/60), ':', (matchingQuiz.timestamp%60).toString().padStart(2,'0'), ')');
        console.log('Question:', matchingQuiz.question);
        
        // Pause video immediately
        try {
          latestPlayer.pauseVideo();
          setIsPlaying(false);
          console.log('✅ Video paused');
        } catch (e) {
          console.error('Error pausing video:', e);
        }
        
        // Show quiz
        setCurrentQuiz(matchingQuiz);
        setCurrentTime(newTime);
      } else {
        console.log('❌ No matching quiz found at time:', newTime);
      }
    } catch (err) {
      console.error('Error checking for quiz:', err);
    }
  }, []); // Empty deps - uses refs for all data

  // Load video metadata and quizzes
  useEffect(() => {
    async function load() {
      if (!videoId) {
        setError("Video ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("VideoLecturePlayer: Loading video:", videoId);

        // If full YouTube URL passed, extract ID
        const looksLikeUrl = String(videoId).startsWith("http");
        let videoData;

        if (looksLikeUrl) {
          const s = String(videoId).trim();
          const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|watch\?v=)?([A-Za-z0-9_-]{11})/);
          const id = m ? m[1] : null;

          videoData = {
            title: "External Video",
            src: id ? `https://www.youtube.com/watch?v=${id}` : s,
            thumbnail: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined,
            videoId: id || null,
            provider: id ? "youtube" : "unknown",
            segmentTimestamps: []
          };
        } else {
          // Fetch from backend
          const res = await api.get(`/video-lectures/${videoId}`);
          const body = res.data;
          const payload = body?.data || body;

          videoData = {
            title: payload.title || body.title || "Untitled Video",
            src: payload.src || body.src,
            thumbnail: payload.thumbnail || body.thumbnail,
            durationSeconds: payload.durationSeconds || body.durationSeconds,
            segmentTimestamps: payload.segmentTimestamps || body.segmentTimestamps || [],
            provider: payload.provider || body.provider || "youtube",
            videoId: payload.videoId || body.videoId
          };

          if (!videoData.src) throw new Error("Video source URL missing");

          // Normalize YouTube URL - extract video ID
          if (videoData.videoId && videoData.videoId.length === 11) {
            videoData.src = `https://www.youtube.com/watch?v=${videoData.videoId}`;
            videoData.thumbnail = videoData.thumbnail || `https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`;
          } else {
            const m = videoData.src.match(/(?:v=|youtu\.be\/|\/embed\/|watch\?v=)?([A-Za-z0-9_-]{11})/);
            if (m && m[1]) {
              videoData.videoId = m[1];
              videoData.src = `https://www.youtube.com/watch?v=${m[1]}`;
              videoData.thumbnail = videoData.thumbnail || `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
            }
          }
        }

        if (!videoData.videoId) {
          throw new Error("Could not extract YouTube video ID");
        }

        console.log("Video metadata loaded:", videoData);
        setVideoMeta(videoData);

        // Fetch quizzes for this video
        try {
          console.log('📚 Fetching quizzes for video:', videoId);
          const quizzesResponse = await videoLectureAPI.getQuizzes(videoId);
          if (quizzesResponse.success && quizzesResponse.data) {
            console.log('✅ Loaded quizzes:', quizzesResponse.data.length);
            console.log('📝 Quiz timestamps:', quizzesResponse.data.map(q => `${Math.floor(q.timestamp / 60)}:${(q.timestamp % 60).toString().padStart(2, '0')}`).join(', '));
            setQuizzes(quizzesResponse.data);
          } else {
            console.warn('⚠️ No quizzes found');
          }
        } catch (quizError) {
          console.error('❌ Failed to load quizzes:', quizError);
        }

      } catch (err) {
        console.error("Error loading video meta", err);
        const msg =
          err?.response?.status === 401 ? "Unauthorized" :
          err?.response?.status === 404 ? "Video not found" :
          err.message || "Failed to load video";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [videoId]);

  // Initialize YouTube IFrame API Player
  useEffect(() => {
    if (!videoMeta?.videoId || ytPlayer) return; // Don't reinitialize if player exists

    const playerId = `youtube-player-${videoMeta.videoId}`;
    let checkContainerInterval = null;
    let initialized = false;

    function initializePlayer() {
      if (initialized || ytPlayer) return; // Prevent multiple initializations
      
      const container = document.getElementById(playerId);
      if (!container) {
        console.warn('Player container not found:', playerId);
        return;
      }

      // Check if YouTube IFrame API is loaded
      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
        console.log('⏳ Waiting for YouTube IFrame API to load...');
        
        // Set up callback if not already set
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          console.log('✅ YouTube IFrame API ready');
          if (originalCallback) originalCallback();
          if (!initialized && !ytPlayer) {
            initializePlayer();
          }
        };
        return;
      }

      initialized = true;
      console.log('🎬 Initializing YouTube Player for video:', videoMeta.videoId);

      try {
        const player = new window.YT.Player(playerId, {
          videoId: videoMeta.videoId,
          playerVars: {
            enablejsapi: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              console.log('✅ YouTube Player ready');
              setYtPlayer(event.target);
              setPlayerReady(true);
            },
            onStateChange: (event) => {
              // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
              const state = event.data;
              if (state === 1) {
                setIsPlaying(true);
                console.log('▶️ Video playing');
                // Check for quiz when video starts playing (in case user seeked)
                setTimeout(() => checkForQuizAtCurrentTime(), 500);
              } else if (state === 2) {
                setIsPlaying(false);
                console.log('⏸️ Video paused');
                // Check for quiz when paused (user might have seeked to quiz timestamp)
                setTimeout(() => checkForQuizAtCurrentTime(), 500);
              } else if (state === 0) {
                setIsPlaying(false);
                setCurrentTime(0);
                console.log('⏹️ Video ended');
              } else if (state === 3) {
                // Buffering - often happens after seeking
                console.log('⏳ Video buffering (possible seek)');
                // Check for quiz after buffering completes
                setTimeout(() => checkForQuizAtCurrentTime(), 1500);
              }
            },
            onError: (event) => {
              console.error('❌ YouTube Player error:', event.data);
              setError('Failed to load video. Error code: ' + event.data);
            }
          }
        });

        // Store player reference
        setYtPlayer(player);
      } catch (err) {
        console.error('❌ Failed to initialize YouTube Player:', err);
        setError('Failed to initialize video player');
        initialized = false;
      }
    }

    // Wait for container to be rendered
    checkContainerInterval = setInterval(() => {
      const container = document.getElementById(playerId);
      if (container) {
        clearInterval(checkContainerInterval);
        initializePlayer();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      if (checkContainerInterval) clearInterval(checkContainerInterval);
    }, 5000);

    // Also try immediate initialization if API is ready
    if (typeof window.YT !== 'undefined' && typeof window.YT.Player !== 'undefined') {
      setTimeout(initializePlayer, 200);
    }

    // Cleanup
    return () => {
      if (checkContainerInterval) clearInterval(checkContainerInterval);
      if (ytPlayer) {
        try {
          ytPlayer.destroy();
        } catch (e) {
          console.warn('Error destroying player:', e);
        }
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current);
      }
    };
  }, [videoMeta?.videoId, checkForQuizAtCurrentTime]);

  // Progress tracking and quiz checking
  useEffect(() => {
    if (!ytPlayer || !playerReady || quizzes.length === 0) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    console.log('🎬 Starting progress tracking | Quizzes:', quizzes.length);
    console.log('📝 Quiz timestamps:', quizzes.map(q => `${Math.floor(q.timestamp / 60)}:${(q.timestamp % 60).toString().padStart(2, '0')}`).join(', '));

    // Track progress every 500ms (more frequent for better quiz detection)
    progressIntervalRef.current = setInterval(() => {
      try {
        // Use refs to get latest player state
        const latestPlayer = ytPlayerRef.current;
        const latestReady = playerReadyRef.current;
        
        if (!latestPlayer || !latestReady) {
          if (!latestPlayer) console.log('⚠️ Progress interval: No player ref');
          if (!latestReady) console.log('⚠️ Progress interval: Player not ready');
          return;
        }

        // Get current time from YouTube player
        const time = latestPlayer.getCurrentTime();
        const newTime = Math.floor(time);
        
        // Always check for quiz, even if paused (handles seeks)
        // Use refs to ensure we have latest data
        const latestQuizzes = quizzesRef.current;
        const latestAnswered = answeredQuizzesRef.current;
        const latestCurrentQuiz = currentQuizRef.current;
        
        if (latestQuizzes.length > 0 && !latestCurrentQuiz) {
          // Direct quiz check - doesn't rely on callbacks, uses refs for latest data
          const directMatch = latestQuizzes.find(q => {
            const quizTime = Math.floor(q.timestamp);
            const timeDiff = Math.abs(quizTime - newTime);
            const isMatch = !latestAnswered.has(q._id) && timeDiff <= 10; // Wide tolerance
            
            if (timeDiff <= 15) {
              console.log('🔍 Direct check - Quiz:', quizTime, 'Current:', newTime, 'Diff:', timeDiff, 'Match:', isMatch, 'Answered:', latestAnswered.has(q._id));
            }
            
            return isMatch;
          });
          
          if (directMatch) {
            console.log('🛑🛑🛑 DIRECT QUIZ MATCH IN INTERVAL! 🛑🛑🛑');
            console.log('Time:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ')');
            console.log('Quiz timestamp:', directMatch.timestamp, 'seconds (', Math.floor(directMatch.timestamp/60), ':', (directMatch.timestamp%60).toString().padStart(2,'0'), ')');
            console.log('Question:', directMatch.question);
            try {
              ytPlayer.pauseVideo();
              setIsPlaying(false);
              setCurrentQuiz(directMatch);
              setCurrentTime(newTime);
              console.log('✅ Quiz set and video paused');
            } catch (e) {
              console.error('Error in direct quiz match:', e);
            }
          }
        }
        
        // Update lastTimeRef for seek detection
        const seekTimeDiff = Math.abs(newTime - lastTimeRef.current);
        if (seekTimeDiff > 3 && lastTimeRef.current > 0) {
          console.log('⏩⏩⏩ SEEK DETECTED IN INTERVAL! Time jumped from', lastTimeRef.current, 'to', newTime, 'seconds');
          // Trigger additional quiz check after seek
          setTimeout(() => {
            const checkPlayer = ytPlayerRef.current;
            const checkReady = playerReadyRef.current;
            if (checkPlayer && checkReady) {
              const seekTime = Math.floor(checkPlayer.getCurrentTime());
              console.log('🔍 Post-seek quiz check at time:', seekTime);
              const seekMatch = latestQuizzes.find(q => {
                const quizTime = Math.floor(q.timestamp);
                const seekDiff = Math.abs(quizTime - seekTime);
                return !latestAnswered.has(q._id) && seekDiff <= 10;
              });
              if (seekMatch) {
                console.log('🛑🛑🛑 QUIZ FOUND AFTER SEEK IN INTERVAL!');
                try {
                  checkPlayer.pauseVideo();
                  setIsPlaying(false);
                  setCurrentQuiz(seekMatch);
                  setCurrentTime(seekTime);
                } catch (e) {
                  console.error('Error in seek quiz match:', e);
                }
              }
            }
          }, 500);
        }
        lastTimeRef.current = newTime;

        if (newTime !== currentTime && newTime >= 0) {
          // Log every 5 seconds or when near quiz timestamps
          const nearQuiz = latestQuizzes.some(q => Math.abs(Math.floor(q.timestamp) - newTime) <= 5);
          if (newTime % 5 === 0 || newTime < 15 || nearQuiz) {
            const availableQuizzes = latestQuizzes.filter(q => !latestAnswered.has(q._id)).map(q => Math.floor(q.timestamp));
            console.log('⏱️ Video time:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ') | Available quiz times:', availableQuizzes.join(', '));
          }
          
          setCurrentTime(newTime);

          // Check for quiz at this timestamp (works when playing OR paused - handles seeks)
          // Always check, even when paused (user might have seeked to quiz timestamp)
          if (!latestCurrentQuiz && latestQuizzes.length > 0) {
            const matchingQuiz = latestQuizzes.find(q => {
              const quizTime = Math.floor(q.timestamp);
              const timeDiff = Math.abs(quizTime - newTime);
              // Use 3 second tolerance for normal playback (increased from 2)
              const isMatch = !latestAnswered.has(q._id) && timeDiff <= 3;
              
              // Log when we're close to a quiz
              if (timeDiff <= 10 && !isMatch) {
                console.log('🔍 Near quiz at', quizTime, 'seconds (', Math.floor(quizTime/60), ':', (quizTime%60).toString().padStart(2,'0'), ') - Current:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ') - Diff:', timeDiff, 'seconds');
              }
              
              if (isMatch) {
                console.log('🎯🎯🎯 QUIZ MATCH! Current time:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ') Quiz time:', quizTime, 'seconds (', Math.floor(quizTime/60), ':', (quizTime%60).toString().padStart(2,'0'), ')');
              }
              return isMatch;
            });
            
            if (matchingQuiz) {
              console.log('🛑🛑🛑 TRIGGERING QUIZ NOW! 🛑🛑🛑');
              console.log('Time:', newTime, 'seconds (', Math.floor(newTime/60), ':', (newTime%60).toString().padStart(2,'0'), ')');
              console.log('Quiz timestamp:', matchingQuiz.timestamp, 'seconds (', Math.floor(matchingQuiz.timestamp/60), ':', (matchingQuiz.timestamp%60).toString().padStart(2,'0'), ')');
              console.log('Question:', matchingQuiz.question);
              
              // Pause video immediately
              try {
                latestPlayer.pauseVideo();
                setIsPlaying(false);
                console.log('✅ Video paused for quiz');
              } catch (e) {
                console.error('Error pausing video:', e);
              }
              
              // Show quiz
              setCurrentQuiz(matchingQuiz);
            }
          }
        }
      } catch (err) {
        console.error('Error in progress tracking:', err);
      }
    }, 500);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (seekCheckTimeoutRef.current) {
        clearTimeout(seekCheckTimeoutRef.current);
      }
    };
  }, [ytPlayer, playerReady, quizzes, currentTime, isPlaying, currentQuiz, answeredQuizzes]);

  // Keep video paused while quiz is active and handle timer
  useEffect(() => {
    if (currentQuiz && ytPlayer) {
      console.log('⏸️ Quiz active - keeping video paused');
      
      // Reset timer to 60 seconds when quiz appears
      setQuizTimeRemaining(60);
      
      // Timer countdown
      const timerInterval = setInterval(() => {
        setQuizTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto-close quiz and mark as unanswered
            console.log('⏰ Quiz time expired - auto-closing');
            clearInterval(timerInterval);
            
            // Mark as unanswered
            setAnsweredQuizzes(prevSet => new Set([...prevSet, currentQuiz._id]));
            const newSummary = {
              ...presenceSummary,
              quizzesUnanswered: presenceSummary.quizzesUnanswered + 1
            };
            setPresenceSummary(newSummary);
            
            if (onPresenceUpdate) {
              onPresenceUpdate(newSummary);
            }
            
            // Close quiz and resume video
            setCurrentQuiz(null);
            try {
              ytPlayer.playVideo();
              setIsPlaying(true);
            } catch (e) {
              console.error('Error resuming video after timeout:', e);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
      
      // Keep video paused
      pauseIntervalRef.current = setInterval(() => {
        try {
          if (ytPlayer && ytPlayer.getPlayerState() === 1) { // 1 = playing
            ytPlayer.pauseVideo();
            setIsPlaying(false);
          }
        } catch (e) {
          console.warn('Error keeping video paused:', e);
        }
      }, 500);
      
      return () => {
        clearInterval(timerInterval);
        if (pauseIntervalRef.current) {
          clearInterval(pauseIntervalRef.current);
          pauseIntervalRef.current = null;
        }
      };
    } else {
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current);
        pauseIntervalRef.current = null;
      }
      // Reset timer when quiz closes
      setQuizTimeRemaining(60);
    }
  }, [currentQuiz, ytPlayer, presenceSummary, onPresenceUpdate]);

  // Handle quiz submission
  const handleQuizSubmit = async (selectedIndex) => {
    if (!currentQuiz || !ytPlayer) return;
    
    try {
      const response = await videoLectureAPI.submitQuiz({
        quizId: currentQuiz._id,
        selectedIndex,
        videoTimestamp: currentTime,
        videoId: videoId
      });
      
      if (response.success) {
        // Mark quiz as answered
        setAnsweredQuizzes(prev => new Set([...prev, currentQuiz._id]));
        
        // Update presence summary
        const newSummary = {
          quizzesAnswered: presenceSummary.quizzesAnswered + 1,
          quizzesCorrect: response.isCorrect ? presenceSummary.quizzesCorrect + 1 : presenceSummary.quizzesCorrect,
          quizzesUnanswered: presenceSummary.quizzesUnanswered,
          presenceScore: response.summary?.presenceScore || presenceSummary.presenceScore
        };
        setPresenceSummary(newSummary);
        
        // Notify parent component
        if (onPresenceUpdate) {
          onPresenceUpdate(newSummary);
        }
        
        // Close quiz modal
        setCurrentQuiz(null);
        
        // Resume video playback
        console.log('▶️ Resuming video after quiz');
        try {
          ytPlayer.playVideo();
          setIsPlaying(true);
        } catch (e) {
          console.error('Error resuming video:', e);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px] bg-gray-900 dark:bg-dark-800">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-gray-900 dark:bg-dark-800 min-h-[400px] flex items-center justify-center">
        <div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!videoMeta || !videoMeta.videoId) {
    return (
      <div className="p-8 text-center bg-gray-900 dark:bg-dark-800 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">Video data not available</p>
      </div>
    );
  }

  const playerId = `youtube-player-${videoMeta.videoId}`;

  return (
    <div className="w-full bg-gray-900 dark:bg-dark-800">
      {/* Quiz Modal */}
      {currentQuiz && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Timer Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Quiz Question
              </h3>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  quizTimeRemaining <= 10 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : quizTimeRemaining <= 30 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  ⏱️ {quizTimeRemaining}s
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  quizTimeRemaining <= 10 
                    ? 'bg-red-500' 
                    : quizTimeRemaining <= 30 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${(quizTimeRemaining / 60) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              {currentQuiz.question}
            </p>
            <div className="space-y-3 mb-6">
              {currentQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizSubmit(index)}
                  className="w-full text-left p-4 bg-gray-100 dark:bg-dark-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </button>
              ))}
            </div>
            {currentQuiz.explanation && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {currentQuiz.explanation}
              </p>
            )}
            {quizTimeRemaining <= 10 && (
              <p className="text-sm text-red-500 font-semibold mt-4 text-center animate-pulse">
                ⚠️ Time running out! Please answer quickly.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Video Player Container */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 dark:bg-dark-800/50 z-10 transition-opacity duration-500 pointer-events-none">
            <div className="text-center opacity-75">
              <Loader size="md" />
              <p className="mt-2 text-gray-400 text-xs">Initializing player...</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black" ref={playerContainerRef}>
          <div id={playerId} style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}
