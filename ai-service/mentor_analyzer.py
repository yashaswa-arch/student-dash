"""
AI Coding Mentor - Analyzes student solutions and provides coaching feedback
"""

import json
from typing import Dict, List, Any

MENTOR_SYSTEM_PROMPT = """You are an AI coding mentor. Your job is to analyze the student's solution to a DSA problem and coach them like a real interview prep mentor, not a generic chatbot.

Your goals:
1. Evaluate whether the solution is correct.
2. Identify the approach used (brute force / hashing / two-pointer / DP / recursion etc).
3. Judge efficiency vs expected optimal solution.
4. Give targeted feedback and improvement points.
5. Suggest one optimal solution idea, not full code unless asked.
6. Recommend the next problem based on weaknesses.
7. Tone adapts based on student history:
   - If repeating same mistake: direct and strict.
   - If improving: concise praise with specific corrections.
   - If stuck: guiding tone with hints.

Rules:
- Never tell the student "random" advice.
- Feedback must be based on their actual code + history.
- Do not just say "optimize" → explain how.
- Do not spoon-feed full code unless asked.
- Your role is to build logic & thinking ability, not solve it for them.

Output format (strict JSON):
{
  "analysis_summary": "Short crisp analysis of the solution.",
  "approach_detected": "...",
  "correctness": true/false,
  "time_complexity": "...",
  "space_complexity": "...",
  "strengths": ["...","..."],
  "weaknesses": ["...","..."],
  "improvement_suggestions": ["...","..."],
  "next_problem_recommendation": {
      "topic": "...",
      "why": "..."
  },
  "mindset_coaching": "One short line pushing them to think better."
}

Style:
- Precise, technical, no fluff.
- Act like a tough but fair interview mentor.
- Push the student to improve every time.

Example tones:

Weak solution repeated mistake:
> "You solved it but again used brute force. You keep ignoring hashing even when input hints demand it. Fix your pattern recognition."

Good effort but not optimal:
> "Correct logic but you jumped to coding too soon. Think pattern first next time. Use sliding window here for O(n)."

Significant improvement:
> "Better. You correctly chose hashmap. Next step is cleaner variable naming and edge case notes."
"""


def build_mentor_input(
    problem_title: str,
    problem_description: str,
    optimal_approach: str,
    optimal_complexity: Dict[str, str],
    user_code: str,
    language: str,
    test_results: Dict[str, Any],
    user_history: Dict[str, Any],
    codebert_analysis: Dict[str, Any]
) -> str:
    """Build the input prompt for the mentor AI"""
    
    input_data = {
        "problem_title": problem_title,
        "problem_description": problem_description,
        "expected_optimal_approach": optimal_approach,
        "expected_complexity": optimal_complexity,
        "user_code": user_code,
        "language": language,
        "test_results": {
            "total_tests": test_results.get("total", 0),
            "passed": test_results.get("passed", 0),
            "failed": test_results.get("failed", 0),
            "test_details": test_results.get("details", [])
        },
        "user_history": user_history,
        "codebert_analysis": codebert_analysis
    }
    
    return json.dumps(input_data, indent=2)


def analyze_with_mentor(
    problem_data: Dict[str, Any],
    submission_data: Dict[str, Any],
    user_history: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main function to analyze code with mentor prompt
    
    Args:
        problem_data: Question details (title, description, optimal approach, etc.)
        submission_data: User's code, language, test results
        user_history: User's coding history (patterns, mistakes, mastery)
    
    Returns:
        Structured mentor feedback as JSON
    """
    
    # Build input for the AI model
    mentor_input = build_mentor_input(
        problem_title=problem_data.get("title", ""),
        problem_description=problem_data.get("description", ""),
        optimal_approach=problem_data.get("optimalApproach", ""),
        optimal_complexity=problem_data.get("optimalComplexity", {}),
        user_code=submission_data.get("code", ""),
        language=submission_data.get("language", ""),
        test_results=submission_data.get("testResults", {}),
        user_history=user_history,
        codebert_analysis=submission_data.get("codebertAnalysis", {})
    )
    
    # TODO: Call actual AI model (CodeBERT fine-tuned or GPT-4)
    # For now, return a mock response structure
    
    # This is where you'd call:
    # - Your fine-tuned CodeBERT model
    # - Or OpenAI GPT-4 with the mentor prompt
    # - Or Anthropic Claude
    
    # Mock response for development
    return generate_mock_mentor_response(problem_data, submission_data, user_history)


def generate_mock_mentor_response(
    problem_data: Dict[str, Any],
    submission_data: Dict[str, Any],
    user_history: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate a mock mentor response for testing
    This should be replaced with actual AI model call
    """
    
    test_results = submission_data.get("testResults", {})
    passed = test_results.get("passed", 0)
    total = test_results.get("total", 0)
    correctness = passed == total and total > 0
    
    # Detect if brute force based on complexity
    codebert = submission_data.get("codebertAnalysis", {})
    detected_complexity = codebert.get("complexity", "O(n)")
    
    # Ensure detected_complexity is a string
    if not isinstance(detected_complexity, str):
        detected_complexity = str(detected_complexity) if detected_complexity else "O(n)"
    
    # Safely get optimal complexity (might be dict or string)
    optimal_complexity_data = problem_data.get("optimalComplexity", {})
    if isinstance(optimal_complexity_data, dict):
        optimal_complexity = optimal_complexity_data.get("time", "O(n)")
    else:
        optimal_complexity = str(optimal_complexity_data) if optimal_complexity_data else "O(n)"
    
    is_brute_force = "n^2" in detected_complexity or "n²" in detected_complexity
    is_optimal = detected_complexity == optimal_complexity
    
    # Check for repeated mistakes
    common_mistakes = user_history.get("commonMistakes", [])
    recent_patterns = user_history.get("recentPatterns", [])
    mastered_patterns = user_history.get("masteredPatterns", [])
    
    # Determine tone based on history
    if len(common_mistakes) > 2 and is_brute_force:
        tone = "strict"
        mindset = "You solved it but again used brute force. You keep ignoring hashing even when input hints demand it. Fix your pattern recognition."
    elif correctness and not is_optimal:
        tone = "encouraging"
        mindset = "Correct logic but you jumped to coding too soon. Think pattern first next time. Hash Table here for O(n)."
    elif correctness and is_optimal:
        tone = "praise"
        mindset = "Better. You correctly chose the optimal approach. Next step is cleaner variable naming and edge case notes."
    else:
        tone = "guiding"
        mindset = "You're on the right track. Read the constraints again - they hint at the optimal pattern."
    
    return {
        "analysis_summary": f"{'Correct' if correctness else 'Incorrect'} solution using {codebert.get('approach', 'unknown approach')}. {'Optimal' if is_optimal else 'Not optimal'} complexity.",
        "approach_detected": codebert.get("approach", "Brute Force"),
        "correctness": correctness,
        "time_complexity": detected_complexity,
        "space_complexity": codebert.get("spaceComplexity", "O(1)"),
        "strengths": [
            "Correct boundary checks",
            "Clean variable names",
            "Handles edge cases"
        ] if correctness else ["Attempted the problem", "Basic structure is correct"],
        "weaknesses": [
            f"Using {detected_complexity} when {optimal_complexity} is possible",
            "Missing input validation",
            "Could use more descriptive names"
        ] if not is_optimal else ["Minor style improvements needed"],
        "improvement_suggestions": [
            f"Use {problem_data.get('optimalApproach', 'Hash Table')} instead of nested loops",
            "Add input validation for edge cases",
            "Consider space-time tradeoffs"
        ],
        "next_problem_recommendation": {
            "topic": problem_data.get("optimalApproach", "Hash Table"),
            "why": f"You need to master {problem_data.get('optimalApproach', 'Hash Table')} before moving to harder patterns"
        },
        "mindset_coaching": mindset,
        "tone_used": tone,
        "test_results_summary": f"{passed}/{total} tests passed"
    }


