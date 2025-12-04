"""
HONEST LeetCode Code Analyzer
NO fake praise. NO templates. REAL analysis only.
"""

from typing import Dict, List, Any
import re
import ast
import random


def analyze_leetcode_code(
    code: str,
    language: str,
    problem_title: str,
    problem_description: str
) -> Dict[str, Any]:
    """
    HONEST code analysis following strict rules:
    1. Check if code exists
    2. Check syntax errors
    3. Analyze actual logic
    4. Real complexity analysis
    5. Unique suggestions (no templates)
    6. Scoring rubric
    """
    
    # RULE 1: Check if code exists
    if not code or code.strip() == "":
        return {
            "timeComplexity": "N/A",
            "spaceComplexity": "N/A",
            "mistakes": ["❌ No solution submitted. You must write code to get analysis."],
            "missingEdgeCases": [],
            "improvements": ["Start by understanding the problem and writing a basic solution."],
            "bruteToOptimalSuggestions": [],
            "hint": "Write some code first, even if it's not perfect.",
            "score": {
                "correctness": 0,
                "efficiency": 0,
                "codeQuality": 0,
                "overall": 0
            }
        }
    
    # RULE 2: Try parsing/compiling
    syntax_errors = check_syntax(code, language)
    if syntax_errors:
        return {
            "timeComplexity": "N/A - Code has syntax errors",
            "spaceComplexity": "N/A - Code has syntax errors",
            "mistakes": syntax_errors,
            "missingEdgeCases": [],
            "improvements": ["Fix syntax errors first before analyzing logic."],
            "bruteToOptimalSuggestions": [],
            "hint": "Your code won't compile. Check the syntax errors above.",
            "score": {
                "correctness": 0,
                "efficiency": 0,
                "codeQuality": 10,
                "overall": 3
            }
        }
    
    # RULE 3 & 4: Analyze actual code structure
    time_complexity = analyze_real_time_complexity(code, language)
    space_complexity = analyze_real_space_complexity(code, language)
    
    # RULE 5: Find REAL mistakes based on actual code
    mistakes = find_real_mistakes(code, language, problem_title)
    
    # Find REAL missing edge cases
    missing_edge_cases = find_real_edge_cases(code, language, problem_description)
    
    # RULE 6: Generate UNIQUE improvements (not templates)
    improvements = generate_unique_improvements(code, language, time_complexity, problem_title)
    
    # RULE 7: Brute to optimal (if applicable)
    brute_suggestions = suggest_optimization_path(code, language, time_complexity, problem_title)
    
    # RULE 8: Varying tone - honest feedback
    hint = generate_honest_hint(code, language, problem_title, time_complexity)
    
    # RULE 9: Scoring rubric
    score = calculate_honest_score(code, language, time_complexity, mistakes, missing_edge_cases)
    
    return {
        "timeComplexity": time_complexity,
        "spaceComplexity": space_complexity,
        "mistakes": mistakes if mistakes else ["✓ No obvious logical errors detected in code structure."],
        "missingEdgeCases": missing_edge_cases if missing_edge_cases else ["✓ Basic edge cases seem covered, but always test thoroughly."],
        "improvements": improvements,
        "bruteToOptimalSuggestions": brute_suggestions,
        "hint": hint,
        "score": score
    }


def check_syntax(code: str, language: str) -> List[str]:
    """RULE 2: Check for actual syntax errors"""
    errors = []
    
    if language == "python":
        try:
            ast.parse(code)
        except SyntaxError as e:
            errors.append(f"❌ Syntax Error at line {e.lineno}: {e.msg}")
        except Exception as e:
            errors.append(f"❌ Code parsing failed: {str(e)}")
    
    elif language in ["javascript", "js"]:
        # Basic JS syntax checks
        if code.count('(') != code.count(')'):
            errors.append("❌ Unmatched parentheses - check your function calls")
        if code.count('{') != code.count('}'):
            errors.append("❌ Unmatched braces - check your code blocks")
        if code.count('[') != code.count(']'):
            errors.append("❌ Unmatched brackets - check your arrays")
    
    elif language == "java":
        if code.count('{') != code.count('}'):
            errors.append("❌ Unmatched braces in Java code")
        if not re.search(r'(public|private|protected)?\s+(static\s+)?\w+\s+\w+\s*\(', code):
            errors.append("❌ No valid method declaration found")
    
    return errors


def analyze_real_time_complexity(code: str, language: str) -> str:
    """RULE 4: Analyze ACTUAL time complexity based on code structure"""
def analyze_real_time_complexity(code: str, language: str) -> str:
    """RULE 4: Analyze ACTUAL time complexity based on code structure"""
    code_lower = code.lower()
    
    # Count actual nested loops
    nested_depth = 0
    max_nesting = 0
    
    for line in code.split('\n'):
        line_stripped = line.strip().lower()
        if 'for ' in line_stripped or 'while ' in line_stripped:
            nested_depth += 1
            max_nesting = max(max_nesting, nested_depth)
        # Rough heuristic for loop end
        if line_stripped == '' or (line_stripped and not line.startswith(' ')):
            nested_depth = max(0, nested_depth - 1)
    
    # Check for recursion
    has_recursion = bool(re.search(r'def\s+(\w+).*:\s*.*\1\(', code)) or 'recursion' in code_lower
    
    # Check for sorting
    has_sort = 'sort' in code_lower or '.sorted' in code_lower
    
    # Check for binary search
    has_binary_search = 'binary' in code_lower or ('left' in code_lower and 'right' in code_lower and 'mid' in code_lower)
    
    # Actual complexity determination
    if max_nesting >= 3:
        return f"O(n³) - You have {max_nesting} nested loops. This is SLOW for large inputs."
    elif max_nesting == 2:
        return "O(n²) - Nested loops detected. Consider if this can be optimized."
    elif has_sort:
        return "O(n log n) - Sorting dominates the complexity."
    elif has_binary_search:
        return "O(log n) - Binary search detected. Good efficiency."
    elif has_recursion:
        return "O(2ⁿ) or worse - Recursion without memoization can be exponential."
    elif max_nesting == 1:
        return "O(n) - Single pass through data. Decent efficiency."
    else:
        return "O(1) - Constant time, or complexity unclear from code structure."


def analyze_real_space_complexity(code: str, language: str) -> str:
    """Analyze ACTUAL space usage with language-aware heuristics"""
    code_lower = code.lower()
    lang = (language or "").lower()

    # Check for data structures (avoid misclassifying Java code blocks as dicts)
    if lang == "java":
        has_dict = ("hashmap" in code_lower) or (" map<" in code_lower) or ("new hashmap" in code_lower)
    else:
        has_dict = ('{' in code) or ('dict' in code_lower) or ('hashmap' in code_lower) or ('map' in code_lower)

    has_list = ('[' in code) or ('list' in code_lower) or ('array' in code_lower)
    has_set = 'set(' in code_lower or (' hashset' in code_lower) or ('new hashset' in code_lower)
    has_recursion = bool(re.search(r'def\s+(\w+).*:\s*.*\1\(', code))

    # Count data structure allocations actually implied by code
    space_usage = []
    if has_dict:
        space_usage.append("dictionary/map")
    if has_list:
        space_usage.append("list/array")
    if has_set:
        space_usage.append("set")
    if has_recursion:
        space_usage.append("recursion call stack")

    if len(space_usage) >= 2:
        return f"O(n) - Using {', '.join(space_usage)}. Multiple data structures."
    elif len(space_usage) == 1:
        return f"O(n) - {space_usage[0]} grows with input size."
    else:
        return "O(1) - No significant extra space used."


def find_real_mistakes(code: str, language: str, problem_title: str) -> List[str]:
    """RULE 5: Find REAL mistakes in actual code"""
    mistakes = []
    code_lower = code.lower()
    problem_lower = problem_title.lower()
    
    # ⚠️ IMPORTANT: Without test execution, we can only detect structural/syntax issues
    # Logical errors (wrong operator, wrong algorithm) require running test cases
    
    # === PROBLEM-SPECIFIC LOGIC CHECKS ===
    
    # Add Two Numbers - Check for wrong operator
    if 'add' in problem_lower and 'two' in problem_lower:
        # Look for return statement with operators
        return_match = re.search(r'return\s+(\w+)\s*([-*/])\s*(\w+)', code)
        if return_match:
            operator = return_match.group(2)
            if operator == '-':
                mistakes.append("❌ CRITICAL: You're using subtraction (-) but the problem asks to ADD. Should be '+'")
            elif operator == '*':
                mistakes.append("❌ CRITICAL: You're using multiplication (*) but the problem asks to ADD. Should be '+'")
            elif operator == '/':
                mistakes.append("❌ CRITICAL: You're using division (/) but the problem asks to ADD. Should be '+'")
    
    # Subtract/Minus - Check for wrong operator
    if 'subtract' in problem_lower or 'minus' in problem_lower:
        return_match = re.search(r'return\s+(\w+)\s*([\+*/])\s*(\w+)', code)
        if return_match:
            operator = return_match.group(2)
            if operator == '+':
                mistakes.append("❌ CRITICAL: You're using addition (+) but the problem asks to SUBTRACT. Should be '-'")
    
    # Multiply - Check for wrong operator
    if 'multiply' in problem_lower or 'product' in problem_lower:
        return_match = re.search(r'return\s+(\w+)\s*([\+\-/])\s*(\w+)', code)
        if return_match:
            operator = return_match.group(2)
            if operator == '+':
                mistakes.append("❌ CRITICAL: You're using addition (+) but the problem asks to MULTIPLY. Should be '*'")
            elif operator == '-':
                mistakes.append("❌ CRITICAL: You're using subtraction (-) but the problem asks to MULTIPLY. Should be '*'")
    
    # === STRUCTURAL MISTAKES ===
    
    # Off-by-one in loops
    if 'range(' in code_lower:
        if re.search(r'range\([^,]+\s*-\s*1\)', code_lower):
            mistakes.append("⚠️ Possible off-by-one: You're using `range(n-1)`. Double-check if you need all elements.")
    
    # Missing return statement
    lines = code.split('\n')
    has_return = any('return' in line.lower() for line in lines)
    is_function = 'def ' in code_lower or 'public' in code_lower or 'function' in code_lower
    if not has_return and is_function:
        mistakes.append("❌ CRITICAL: No return statement found. Your function returns nothing.")
    
    # Division by zero risk (only if no validation)
    if '/' in code:
        has_zero_check = any(x in code_lower for x in ['!= 0', '!= zero', 'if' in code_lower and '0' in code])
        if not has_zero_check:
            mistakes.append("⚠️ Division without zero check. Add validation to avoid division by zero.")
    
    # Index out of bounds risk
    if '[' in code:
        has_bounds_check = 'len(' in code_lower or 'length' in code_lower or 'size' in code_lower
        if not has_bounds_check:
            mistakes.append("⚠️ Array access without length check. Could cause IndexOutOfBounds error.")
    
    # Empty input not handled
    if 'if not' not in code_lower and 'if len' not in code_lower and 'if' not in code[:50]:
        if '[' in code or 'array' in code_lower or 'nums' in code_lower or 'list' in code_lower:
            mistakes.append("⚠️ No check for empty input. What happens if array/list is empty?")
    
    # Two Sum specific - Nested loops
    if 'two sum' in problem_lower:
        if code.count('for') >= 2 and '{' not in code:
            mistakes.append("💡 You're using nested loops for Two Sum. A hashmap would be O(n) instead of O(n²).")
    
    # If no mistakes found, be honest
    if not mistakes:
        mistakes.append("⚠️ Code structure looks okay, but I cannot verify correctness without running test cases.")
    
    return mistakes


def find_real_edge_cases(code: str, language: str, problem_description: str) -> List[str]:
    """Find REAL missing edge cases based on code"""
    missing = []
    code_lower = code.lower()
    
    # Empty input
    if 'if not' not in code_lower and 'if len' not in code_lower:
        missing.append("Empty input ([], '', 0) - What happens if input is empty?")
    
    # Negative numbers
    if 'int' in problem_description.lower() or 'number' in problem_description.lower():
        if '-' not in code and 'abs' not in code_lower:
            missing.append("Negative numbers - Your code may not handle negative values.")
    
    # Duplicates
    if 'array' in problem_description.lower() or 'list' in problem_description.lower():
        if 'set' not in code_lower and 'unique' not in code_lower:
            missing.append("Duplicate values - Are duplicates handled correctly?")
    
    # Single element
    if '[' in code:
        missing.append("Single element array - Test with array of size 1.")
    
    # Large inputs
    if 'for' in code_lower:
        missing.append("Large inputs (n=10⁵) - Will your solution handle 100,000 elements?")
    
    return missing[:3]  # Top 3 most relevant


def generate_unique_improvements(code: str, language: str, complexity: str, problem_title: str) -> List[str]:
    """RULE 5: Generate UNIQUE improvements based on ACTUAL code"""
    improvements = []
    code_lower = code.lower()
    
    # Based on actual complexity
    if 'O(n²)' in complexity or 'O(n³)' in complexity:
        if '{' not in code and 'dict' not in code_lower:
            improvements.append("🔥 Replace nested loops with a hashmap/dictionary to reduce to O(n)")
        else:
            improvements.append("Your O(n²) solution works but isn't optimal for large inputs. Consider two-pointer or sliding window techniques.")
    
    # Check for code quality issues
    if 'def ' in code_lower:
        func_match = re.search(r'def\s+(\w+)', code)
        if func_match and len(func_match.group(1)) <= 3:
            improvements.append("📝 Use descriptive function names (not just 'sol' or 'f')")
    
    # Variable naming
    if ' x ' in code_lower or ' y ' in code_lower or ' z ' in code_lower:
        improvements.append("📝 Use meaningful variable names instead of x, y, z for better readability")
    
    # Specific to problem
    if 'two sum' in problem_title.lower() and 'for' in code_lower:
        if code.count('for') >= 2:
            improvements.append("💡 Two Sum optimal solution: Use hashmap to store complements (target - current)")
    
    # Add error handling
    if 'try' not in code_lower and 'except' not in code_lower:
        improvements.append("Consider adding input validation or error handling")
    
    # Early return optimization
    if 'return' in code_lower and code.count('return') == 1:
        improvements.append("💡 Consider early returns to avoid unnecessary computation")
    
    return improvements[:4]  # Top 4 most relevant


def suggest_optimization_path(code: str, language: str, complexity: str, problem_title: str) -> List[str]:
    """RULE 6: Suggest optimization ONLY if code is brute force"""
    suggestions = []
    code_lower = code.lower()
    
    # Only suggest if code is actually suboptimal
    if 'O(n²)' in complexity or 'O(n³)' in complexity:
        
        if 'two sum' in problem_title.lower():
            suggestions = [
                "Step 1: Current approach uses nested loops O(n²)",
                "Step 2: Realize you can store seen numbers in a hashmap",
                "Step 3: For each number, check if (target - number) exists in hashmap",
                "Step 4: Final complexity: O(n) time, O(n) space"
            ]
        
        elif 'three sum' in problem_title.lower():
            suggestions = [
                "Step 1: Current O(n³) with three loops",
                "Step 2: Sort array first O(n log n)",
                "Step 3: Fix one element, use two-pointer on remaining",
                "Step 4: Final: O(n²) time"
            ]
        
        else:
            # Generic optimization path
            if code.count('for') >= 2:
                suggestions = [
                    "Step 1: Identify the bottleneck (nested loops)",
                    "Step 2: Look for patterns (sorted array → binary search, frequency → hashmap)",
                    "Step 3: Trade space for time (use extra data structures)",
                    "Step 4: Test edge cases with optimized solution"
                ]
    
    elif 'O(2ⁿ)' in complexity:
        suggestions = [
            "Step 1: Current recursive solution without memoization",
            "Step 2: Add memoization (cache results of subproblems)",
            "Step 3: Or convert to bottom-up dynamic programming",
            "Step 4: Reduce from O(2ⁿ) to O(n) or O(n²)"
        ]
    
    return suggestions


def generate_honest_hint(code: str, language: str, problem_title: str, complexity: str) -> str:
    """RULE 8: Generate varying, honest hints"""
    code_lower = code.lower()
    problem_lower = problem_title.lower()
    
    hints = []
    
    # Problem-specific hints
    if 'add' in problem_lower and 'two' in problem_lower:
        hints.append("For adding two numbers, you need the '+' operator. Check your return statement!")
        hints.append("Addition means sum. Make sure you're using the correct arithmetic operator.")
        hints.append("Review: a + b gives the sum, a - b gives the difference.")
    
    elif 'two sum' in problem_lower:
        if code.count('for') >= 2:
            hints.append("Think: Can you remember what numbers you've seen before? (hashmap)")
        else:
            hints.append("Your approach is on track. Make sure you handle all edge cases.")
    
    elif 'palindrome' in problem_lower:
        hints.append("Compare characters from both ends moving inward (two pointers)")
    
    elif 'sorted' in problem_lower or 'sorted' in code_lower:
        hints.append("Sorted data is a hint: consider binary search O(log n)")
    
    elif 'subarray' in problem_lower:
        hints.append("Subarray problems often use sliding window or prefix sums")
    
    # Complexity-based hints
    if 'O(n²)' in complexity:
        hints.append("Your O(n²) solution is correct but slow. Can you trade space for time?")
    elif 'O(n)' in complexity:
        hints.append("Good linear time solution. Now optimize space if possible.")
    
    # Random selection for variety (RULE 8)
    if hints:
        return random.choice(hints)
    else:
        return "Analyze your loops and data structures. Are you doing redundant work?"


def calculate_honest_score(code: str, language: str, complexity: str, mistakes: List[str], edge_cases: List[str]) -> Dict[str, int]:
    """RULE 9: Honest scoring rubric"""
    
    # Correctness (0-40): Based on mistakes
    correctness = 40
    if not code or not code.strip():
        correctness = 0
    else:
        critical_mistakes = [m for m in mistakes if '❌' in m]
        warning_mistakes = [m for m in mistakes if '⚠️' in m]
        correctness -= len(critical_mistakes) * 15
        correctness -= len(warning_mistakes) * 5
        correctness = max(0, correctness)
    
    # Efficiency (0-30): Based on complexity
    efficiency = 30
    if 'O(n³)' in complexity:
        efficiency = 5
    elif 'O(n²)' in complexity:
        efficiency = 15
    elif 'O(n log n)' in complexity:
        efficiency = 22
    elif 'O(n)' in complexity:
        efficiency = 28
    elif 'O(log n)' in complexity:
        efficiency = 30
    elif 'O(1)' in complexity:
        efficiency = 30
    
    # Code Quality (0-30): Based on edge cases and code structure
    quality = 30
    quality -= len(edge_cases) * 3
    if ' x ' in code.lower() or ' y ' in code.lower():
        quality -= 5  # Poor variable names
    quality = max(0, quality)
    
    # Overall
    overall = correctness + efficiency + quality
    
    return {
        "correctness": correctness,
        "efficiency": efficiency,
        "codeQuality": quality,
        "overall": overall
    }

