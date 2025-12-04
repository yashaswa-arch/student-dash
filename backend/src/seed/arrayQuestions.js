const PracticeQuestion = require('../models/PracticeQuestion');

const baseStarterCode = {
  java: `public class Main {
    public static void main(String[] args) {
        // TODO: Implement your solution here
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // TODO: Implement your solution here
    return 0;
}
`,
  python: `def solve():
    # TODO: Implement your solution here
    pass


if __name__ == "__main__":
    solve()
`,
  javascript: `function solve() {
  // TODO: Implement your solution here
}

solve();
`
};

const ARRAY_TOPIC = 'Arrays';

const arrayQuestions = [
  {
    order: 1,
    title: 'Find maximum and minimum in an array',
    difficulty: 'Easy',
    description:
      'Given an array of integers, find the minimum and maximum element in the array. ' +
      'Try to solve it in a single traversal of the array if possible.',
    sampleInput: 'arr = [3, 5, 1, 8, 2]',
    sampleOutput: 'min = 1, max = 8',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nThe array may contain duplicate values.',
    starterCode: baseStarterCode
  },
  {
    order: 2,
    title: 'Reverse an array in-place',
    difficulty: 'Easy',
    description:
      'Given an array of integers, reverse the array in-place without using extra arrays. ' +
      'You should modify the input array such that elements are in reverse order.',
    sampleInput: 'arr = [1, 2, 3, 4, 5]',
    sampleOutput: 'arr = [5, 4, 3, 2, 1]',
    constraints:
      '1 ≤ n ≤ 10^5\nThe solution must run in O(n) time with O(1) extra space.',
    starterCode: baseStarterCode
  },
  {
    order: 3,
    title: 'Find the second largest element in an array',
    difficulty: 'Easy',
    description:
      'Given an array of integers, find the second largest distinct element in the array. ' +
      'If the second largest does not exist, you may return any sentinel value such as -1.',
    sampleInput: 'arr = [7, 4, 9, 1, 9]',
    sampleOutput: 'Second largest = 7',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nArray may contain duplicates.',
    starterCode: baseStarterCode
  },
  {
    order: 4,
    title: 'Maximum subarray sum (Kadane’s algorithm)',
    difficulty: 'Medium',
    description:
      'Given an integer array, find the contiguous subarray with the largest sum and return that sum. ' +
      'This is a classic problem that can be solved efficiently using Kadane’s algorithm.',
    sampleInput: 'arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    sampleOutput: '6   (subarray [4, -1, 2, 1])',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nTime complexity should be O(n).',
    starterCode: baseStarterCode
  },
  {
    order: 5,
    title: 'Rotate array by k positions to the right',
    difficulty: 'Medium',
    description:
      'Given an array, rotate the array to the right by k steps, where k is non-negative. ' +
      'Elements shifted beyond the last position should wrap around to the front.',
    sampleInput: 'arr = [1, 2, 3, 4, 5, 6, 7], k = 3',
    sampleOutput: 'arr = [5, 6, 7, 1, 2, 3, 4]',
    constraints:
      '1 ≤ n ≤ 10^5\n0 ≤ k ≤ 10^9\nTry to solve in O(n) time and O(1) extra space.',
    starterCode: baseStarterCode
  },
  {
    order: 6,
    title: 'Move all zeros to the end (stable)',
    difficulty: 'Medium',
    description:
      'Given an array of integers, move all the zeros to the end of the array while maintaining ' +
      'the relative order of the non-zero elements. Do this operation in-place.',
    sampleInput: 'arr = [0, 1, 0, 3, 12]',
    sampleOutput: 'arr = [1, 3, 12, 0, 0]',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nThe algorithm should run in O(n) time.',
    starterCode: baseStarterCode
  },
  {
    order: 7,
    title: 'Merge two sorted arrays',
    difficulty: 'Easy',
    description:
      'You are given two sorted arrays. Merge them into a single sorted array. ' +
      'You can either return a new merged array or modify one of the input arrays if allowed.',
    sampleInput: 'arr1 = [1, 3, 5], arr2 = [2, 4, 6]',
    sampleOutput: 'merged = [1, 2, 3, 4, 5, 6]',
    constraints:
      '1 ≤ n, m ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nOverall time complexity should be O(n + m).',
    starterCode: baseStarterCode
  },
  {
    order: 8,
    title: 'Check if an array is sorted and rotated',
    difficulty: 'Medium',
    description:
      'Given an array of distinct integers, check if the array is sorted in non-decreasing order ' +
      'and then rotated some number of times. A strictly sorted array is also considered sorted and rotated.',
    sampleInput: 'arr = [3, 4, 5, 1, 2]',
    sampleOutput: 'true',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nArray elements are distinct.',
    starterCode: baseStarterCode
  },
  {
    order: 9,
    title: 'Check if there exists a pair with a given sum',
    difficulty: 'Medium',
    description:
      'Given an unsorted array of integers and a target sum, determine if there exists a pair of elements ' +
      'in the array whose sum is equal to the target. Return true if such a pair exists, otherwise false.',
    sampleInput: 'arr = [8, 7, 2, 5, 3, 1], target = 10',
    sampleOutput: 'true   (pair 8 + 2)',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nTry to do better than O(n^2).',
    starterCode: baseStarterCode
  },
  {
    order: 10,
    title: 'Count frequency of each element in an array',
    difficulty: 'Easy',
    description:
      'Given an array of integers, count the frequency of each distinct element in the array and print the result. ' +
      'You may output the frequencies in any order unless otherwise specified.',
    sampleInput: 'arr = [1, 2, 2, 3, 3, 3]',
    sampleOutput:
      '1 -> 1\n2 -> 2\n3 -> 3',
    constraints:
      '1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\nUse a hash map or similar structure for efficiency.',
    starterCode: baseStarterCode
  }
].map(q => ({
  ...q,
  topic: ARRAY_TOPIC
}));

const seedArrayQuestions = async () => {
  const existingCount = await PracticeQuestion.countDocuments({ topic: ARRAY_TOPIC });

  if (existingCount > 0) {
    console.log(`ℹ️  Array practice questions already seeded (${existingCount} found). Skipping.`);
    return;
  }

  await PracticeQuestion.insertMany(arrayQuestions);
  console.log(`✅ Seeded ${arrayQuestions.length} array practice questions`);
};

module.exports = seedArrayQuestions;


