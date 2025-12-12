/**
 * Student Overview Service
 * Fetches student overview data from the backend API
 */

const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:5000";
const API_BASE = `${BACKEND}/api`;

/**
 * Mock data returned when API call fails
 */
const MOCK_OVERVIEW = {
  totalSolved: 0,
  currentStreakDays: 0,
  practiceMinutesToday: 0,
  efficiency: {
    avgAttemptsPerSolved: 0,
    fastestSolveMins: null
  },
  upcomingInterview: null,
  recentSubmissions: []
};

/**
 * Fetches student overview data from the backend
 * @returns {Promise<Object>} Student overview data
 * @throws {Error} Detailed error if request fails (non-2xx)
 */
export async function fetchStudentOverview() {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    
    // Build headers
    const headers = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make fetch request
    const response = await fetch(`${API_BASE}/student/overview`, {
      method: "GET",
      headers: headers
    });

    // Check if response is ok (status 200-299)
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorDetails = errorData;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          // Ignore text parsing errors
        }
      }

      // Throw detailed error
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      error.details = errorDetails;
      throw error;
    }

    // Parse and return JSON response
    const data = await response.json();
    return data;

  } catch (error) {
    // If it's our thrown error (non-2xx), log it and return mock data
    if (error.status !== undefined) {
      console.error("Failed to fetch student overview:", {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        details: error.details
      });
      return MOCK_OVERVIEW;
    }

    // For network errors or other unexpected errors, log and return mock data
    console.error("Error fetching student overview:", error);
    return MOCK_OVERVIEW;
  }
}

