const { Module, Lesson, Quiz } = require('../models');

// Sample modules for existing courses
const modules = [
  {
    title: "JavaScript Fundamentals",
    description: "Learn the core concepts of JavaScript programming",
    course: null, // Will be populated with actual course ID
    order: 1,
    duration: 180, // 3 hours
    difficulty: "beginner",
    isPublished: true,
    learningObjectives: [
      "Understand variables and data types",
      "Master control structures",
      "Learn about functions and scope",
      "Work with arrays and objects"
    ],
    resources: [
      {
        title: "JavaScript Basics PDF",
        type: "pdf",
        url: "/resources/js-basics.pdf",
        size: 2048576
      },
      {
        title: "Interactive Exercises",
        type: "link",
        url: "https://codepen.io/js-exercises"
      }
    ]
  },
  {
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into advanced JavaScript features",
    course: null,
    order: 2,
    duration: 240, // 4 hours
    difficulty: "intermediate",
    isPublished: true,
    learningObjectives: [
      "Master closures and prototypes",
      "Understand asynchronous programming",
      "Learn ES6+ features",
      "Work with modules and bundlers"
    ]
  },
  {
    title: "Python Basics",
    description: "Introduction to Python programming language",
    course: null,
    order: 1,
    duration: 200,
    difficulty: "beginner",
    isPublished: true,
    learningObjectives: [
      "Python syntax and semantics",
      "Data structures in Python",
      "Object-oriented programming",
      "File handling and error management"
    ]
  }
];

// Sample lessons for modules
const lessons = [
  {
    title: "Variables and Data Types",
    description: "Learn about JavaScript variables and different data types",
    module: null, // Will be populated
    order: 1,
    type: "video",
    content: {
      text: "JavaScript has several data types including numbers, strings, booleans, objects, and more.",
      videoUrl: "https://example.com/videos/js-variables.mp4",
      videoLength: 1200 // 20 minutes
    },
    difficulty: "beginner",
    points: 10,
    isRequired: true,
    isPublished: true,
    tags: ["javascript", "variables", "data-types"]
  },
  {
    title: "Control Structures",
    description: "Master if statements, loops, and switch cases",
    module: null,
    order: 2,
    type: "text",
    content: {
      text: `# Control Structures in JavaScript

Control structures allow you to control the flow of your program execution.

## If Statements
\`\`\`javascript
if (condition) {
  // code to execute
} else if (anotherCondition) {
  // alternative code
} else {
  // fallback code
}
\`\`\`

## Loops
### For Loop
\`\`\`javascript
for (let i = 0; i < 10; i++) {
  console.log(i);
}
\`\`\`

### While Loop
\`\`\`javascript
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}
\`\`\``
    },
    difficulty: "beginner",
    points: 15,
    isRequired: true,
    isPublished: true,
    tags: ["javascript", "control-structures", "loops", "conditionals"]
  },
  {
    title: "Functions Practice",
    description: "Write and test JavaScript functions",
    module: null,
    order: 3,
    type: "code",
    language: "javascript",
    content: {
      instructions: "Write a function that calculates the factorial of a number",
      codeTemplate: `function factorial(n) {
  // Your code here
  
}

// Test your function
console.log(factorial(5)); // Should output 120`,
      expectedOutput: "120",
      testCases: [
        {
          input: "factorial(5)",
          expectedOutput: "120",
          isHidden: false
        },
        {
          input: "factorial(0)",
          expectedOutput: "1",
          isHidden: false
        },
        {
          input: "factorial(10)",
          expectedOutput: "3628800",
          isHidden: true
        }
      ],
      maxAttempts: 5,
      timeLimit: 30
    },
    difficulty: "intermediate",
    points: 25,
    isRequired: true,
    isPublished: true,
    tags: ["javascript", "functions", "recursion", "coding"]
  }
];

// Sample quizzes
const quizzes = [
  {
    title: "JavaScript Fundamentals Quiz",
    description: "Test your knowledge of basic JavaScript concepts",
    course: null, // Will be populated
    module: null,
    questions: [
      {
        question: "Which of the following is NOT a JavaScript data type?",
        type: "multiple_choice",
        options: [
          { text: "String", isCorrect: false },
          { text: "Boolean", isCorrect: false },
          { text: "Float", isCorrect: true },
          { text: "Number", isCorrect: false }
        ],
        points: 2,
        explanation: "JavaScript has Number type which includes both integers and floating-point numbers, but no separate Float type.",
        difficulty: "easy"
      },
      {
        question: "What will console.log(typeof null) output?",
        type: "multiple_choice",
        options: [
          { text: "null", isCorrect: false },
          { text: "undefined", isCorrect: false },
          { text: "object", isCorrect: true },
          { text: "boolean", isCorrect: false }
        ],
        points: 3,
        explanation: "This is a known quirk in JavaScript - typeof null returns 'object' instead of 'null'.",
        difficulty: "medium"
      },
      {
        question: "True or False: JavaScript is a statically typed language.",
        type: "true_false",
        options: [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: true }
        ],
        points: 2,
        explanation: "JavaScript is dynamically typed - variables don't have fixed types.",
        difficulty: "easy"
      },
      {
        question: "Write a function that returns the sum of two numbers",
        type: "code",
        codeTemplate: "function sum(a, b) {\n  // Your code here\n}",
        testCases: [
          {
            input: "sum(2, 3)",
            expectedOutput: "5",
            isHidden: false
          },
          {
            input: "sum(-1, 5)",
            expectedOutput: "4",
            isHidden: true
          }
        ],
        points: 5,
        explanation: "A simple addition function: return a + b;",
        difficulty: "easy"
      }
    ],
    timeLimit: 20,
    passingScore: 70,
    maxAttempts: 3,
    showCorrectAnswers: true,
    randomizeQuestions: false,
    isPublished: true,
    tags: ["javascript", "fundamentals", "assessment"]
  }
];

// Sample achievements
const achievements = [
  {
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "/icons/achievements/first-steps.svg",
    type: "course_completion",
    category: "learning",
    difficulty: "bronze",
    points: 10,
    criteria: {
      coursesCompleted: 1
    },
    design: {
      color: "#CD7F32",
      backgroundColor: "#FFF8DC",
      borderColor: "#B8860B",
      rarity: "common"
    },
    unlockMessage: "Congratulations! You've taken your first step in learning.",
    celebrationMessage: "🎉 Welcome to your learning journey!",
    isActive: true
  },
  {
    name: "Code Warrior",
    description: "Successfully solve 10 coding problems",
    icon: "/icons/achievements/code-warrior.svg",
    type: "skill_mastery",
    category: "coding",
    difficulty: "silver",
    points: 50,
    criteria: {
      customCriteria: {
        successfulSubmissions: 10
      }
    },
    design: {
      color: "#C0C0C0",
      backgroundColor: "#F8F8FF",
      borderColor: "#A9A9A9",
      rarity: "uncommon"
    },
    unlockMessage: "You're becoming a skilled coder!",
    celebrationMessage: "⚔️ Code Warrior unlocked! You're on fire!",
    isActive: true
  },
  {
    name: "Streak Master",
    description: "Maintain a 7-day learning streak",
    icon: "/icons/achievements/streak-master.svg",
    type: "streak",
    category: "learning",
    difficulty: "gold",
    points: 100,
    criteria: {
      studyStreak: 7
    },
    design: {
      color: "#FFD700",
      backgroundColor: "#FFFACD",
      borderColor: "#DAA520",
      rarity: "rare"
    },
    unlockMessage: "Consistency is key! You're building great habits.",
    celebrationMessage: "🔥 Seven days in a row! You're unstoppable!",
    isActive: true
  }
];

module.exports = {
  modules,
  lessons,
  quizzes,
  achievements
};