const Course = require('../models/Course');
const User = require('../models/User');

const courseData = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript programming including variables, functions, objects, and modern ES6+ features. Perfect for beginners starting their coding journey.',
    tags: ['javascript', 'frontend', 'web-development', 'beginner'],
    level: 'Beginner',
    duration: '6 weeks',
    lessonsCount: 24
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming with focus on data analysis, visualization, and machine learning. Includes pandas, numpy, and matplotlib.',
    tags: ['python', 'data-science', 'machine-learning', 'intermediate'],
    level: 'Intermediate',
    duration: '8 weeks',
    lessonsCount: 32
  },
  {
    title: 'React.js Complete Guide',
    description: 'Build modern web applications with React.js. Covers components, hooks, state management, and best practices for frontend development.',
    tags: ['react', 'frontend', 'javascript', 'web-development'],
    level: 'Intermediate',
    duration: '10 weeks',
    lessonsCount: 40
  },
  {
    title: 'Data Structures & Algorithms',
    description: 'Essential computer science concepts for technical interviews. Arrays, linked lists, trees, graphs, sorting, and searching algorithms.',
    tags: ['algorithms', 'data-structures', 'interview-prep', 'advanced'],
    level: 'Advanced',
    duration: '12 weeks',
    lessonsCount: 48
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js and Express. Covers APIs, databases, authentication, and deployment.',
    tags: ['nodejs', 'backend', 'javascript', 'api'],
    level: 'Intermediate',
    duration: '8 weeks',
    lessonsCount: 30
  },
  {
    title: 'Database Design with SQL',
    description: 'Learn database design principles, SQL queries, normalization, and optimization. Covers PostgreSQL and MySQL.',
    tags: ['sql', 'database', 'backend', 'data-modeling'],
    level: 'Beginner',
    duration: '6 weeks',
    lessonsCount: 20
  }
];

const seedCourses = async () => {
  try {
    console.log('📚 Seeding courses...');
    
    // Clear existing courses
    await Course.deleteMany({});
    
    // Get instructors
    const instructors = await User.find({ role: 'instructor' });
    
    if (instructors.length === 0) {
      throw new Error('No instructors found. Please seed users first.');
    }
    
    // Create courses with random instructors
    const coursesWithInstructors = courseData.map((course, index) => ({
      ...course,
      instructor: instructors[index % instructors.length]._id
    }));
    
    const createdCourses = await Course.insertMany(coursesWithInstructors);
    console.log(`✅ Created ${createdCourses.length} courses`);
    
    // Populate and log created courses
    const populatedCourses = await Course.find({}).populate('instructor', 'name email');
    console.log('\n📋 Created Courses:');
    populatedCourses.forEach((course) => {
      console.log(`- ${course.title} (by ${course.instructor.name})`);
    });
    
    return createdCourses;
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
};

module.exports = seedCourses;