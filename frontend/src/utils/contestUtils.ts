/**
 * Normalize platform string to one of the allowed constants
 * @param platform - Platform string from backend (may be in various formats)
 * @returns Normalized platform: "CODEFORCES", "LEETCODE", or "ATCODER"
 */
export function normalizePlatform(platform: string): 'CODEFORCES' | 'LEETCODE' | 'ATCODER' {
  if (!platform || typeof platform !== 'string') {
    return 'CODEFORCES' // Default fallback
  }

  const normalized = platform.trim().toUpperCase()

  // Handle Codeforces variations
  if (
    normalized.includes('CODEFORCES') ||
    normalized.includes('CODEFORCE') ||
    normalized === 'CF' ||
    normalized.startsWith('CF')
  ) {
    return 'CODEFORCES'
  }

  // Handle LeetCode variations
  if (
    normalized.includes('LEETCODE') ||
    normalized.includes('LEET') ||
    normalized === 'LC' ||
    normalized.startsWith('LC')
  ) {
    return 'LEETCODE'
  }

  // Handle AtCoder variations
  if (
    normalized.includes('ATCODER') ||
    normalized === 'AC' ||
    normalized.startsWith('AC')
  ) {
    return 'ATCODER'
  }

  // Map other platforms to one of the three allowed values
  // CODECHEF and other competitive programming platforms → CODEFORCES
  if (
    normalized.includes('CODECHEF') ||
    normalized.includes('HACKERRANK') ||
    normalized.includes('HACKEREARTH') ||
    normalized.includes('TOPCODER') ||
    normalized.includes('CSACADEMY')
  ) {
    return 'CODEFORCES'
  }

  // Default fallback to CODEFORCES if unrecognized
  return 'CODEFORCES'
}

