const CodingQuestion = require('../models/CodingQuestion');

const questionData = [
  // Easy Questions
  {
    title: 'Two Sum',
    statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    difficulty: 'easy',
    tags: ['array', 'hash-table', 'two-pointers'],
    testCases: [
      { input: '[2,7,11,15], target = 9', output: '[0,1]' },
      { input: '[3,2,4], target = 6', output: '[1,2]' },
      { input: '[3,3], target = 6', output: '[0,1]' }
    ]
  },
  {
    title: 'Palindrome Number',
    statement: 'Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.',
    difficulty: 'easy',
    tags: ['math', 'palindrome'],
    testCases: [
      { input: '121', output: 'true' },
      { input: '-121', output: 'false' },
      { input: '10', output: 'false' }
    ]
  },
  {
    title: 'Valid Parentheses',
    statement: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
    difficulty: 'easy',
    tags: ['string', 'stack', 'parentheses'],
    testCases: [
      { input: '"()"', output: 'true' },
      { input: '"()[]{}"', output: 'true' },
      { input: '"(]"', output: 'false' }
    ]
  },
  {
    title: 'Remove Duplicates from Sorted Array',
    statement: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.',
    difficulty: 'easy',
    tags: ['array', 'two-pointers', 'sorting'],
    testCases: [
      { input: '[1,1,2]', output: '2, nums = [1,2,_]' },
      { input: '[0,0,1,1,1,2,2,3,3,4]', output: '5, nums = [0,1,2,3,4,_,_,_,_,_]' }
    ]
  },

  // Medium Questions
  {
    title: 'Add Two Numbers',
    statement: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
    difficulty: 'medium',
    tags: ['linked-list', 'math', 'recursion'],
    testCases: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]' },
      { input: 'l1 = [0], l2 = [0]', output: '[0]' },
      { input: 'l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]', output: '[8,9,9,9,0,0,0,1]' }
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    statement: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'medium',
    tags: ['string', 'sliding-window', 'hash-table'],
    testCases: [
      { input: '"abcabcbb"', output: '3' },
      { input: '"bbbbb"', output: '1' },
      { input: '"pwwkew"', output: '3' }
    ]
  },
  {
    title: 'Container With Most Water',
    statement: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that contains the most water.',
    difficulty: 'medium',
    tags: ['array', 'two-pointers', 'greedy'],
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', output: '49' },
      { input: '[1,1]', output: '1' }
    ]
  },
  {
    title: 'Group Anagrams',
    statement: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    difficulty: 'medium',
    tags: ['array', 'string', 'hash-table', 'sorting'],
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: '[""]', output: '[[""]]' },
      { input: '["a"]', output: '[["a"]]' }
    ]
  },

  // Hard Questions
  {
    title: 'Median of Two Sorted Arrays',
    statement: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    difficulty: 'hard',
    tags: ['array', 'binary-search', 'divide-and-conquer'],
    testCases: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' }
    ]
  },
  {
    title: 'Merge k Sorted Lists',
    statement: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    difficulty: 'hard',
    tags: ['linked-list', 'divide-and-conquer', 'heap', 'merge-sort'],
    testCases: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
      { input: 'lists = [[]]', output: '[]' }
    ]
  },
  {
    title: 'Trapping Rain Water',
    statement: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    difficulty: 'hard',
    tags: ['array', 'two-pointers', 'dynamic-programming', 'stack'],
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: '[4,2,0,3,2,5]', output: '9' }
    ]
  },
  {
    title: 'Valid Number',
    statement: 'A valid number can be split up into these components (in order): A decimal number or an integer, followed by an optional exponent part. Validate if a given string s is a valid number.',
    difficulty: 'hard',
    tags: ['string', 'finite-state-machine'],
    testCases: [
      { input: '"2"', output: 'true' },
      { input: '"0089"', output: 'true' },
      { input: '"-0.1"', output: 'true' },
      { input: '"+3.14"', output: 'true' },
      { input: '"4."', output: 'true' },
      { input: '"abc"', output: 'false' }
    ]
  }
];

const seedCodingQuestions = async () => {
  try {
    console.log('🧩 Seeding coding questions...');
    
    // Clear existing questions
    await CodingQuestion.deleteMany({});
    
    const createdQuestions = await CodingQuestion.insertMany(questionData);
    console.log(`✅ Created ${createdQuestions.length} coding questions`);
    
    // Log summary
    const questionsByDifficulty = await CodingQuestion.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📋 Questions by Difficulty:');
    questionsByDifficulty.forEach((group) => {
      console.log(`- ${group._id}: ${group.count} questions`);
    });
    
    return createdQuestions;
  } catch (error) {
    console.error('❌ Error seeding coding questions:', error);
    throw error;
  }
};

module.exports = seedCodingQuestions;