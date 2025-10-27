const Course = require('../models/Course');
const User = require('../models/User');

const courseData = [
  {
    title: 'Data Structures and Algorithms',
    description: 'Comprehensive course covering fundamental data structures and algorithms essential for technical interviews.',
    tags: ['algorithms', 'data-structures', 'interview-prep', 'computer-science']
  },
  {
    title: 'System Design Fundamentals',
    description: 'Learn to design scalable systems from scratch, covering load balancing, databases, caching, and microservices.',
    tags: ['system-design', 'scalability', 'architecture', 'distributed-systems']
  },
  {
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into JavaScript including closures, prototypes, async programming, and modern ES6+ features.',
    tags: ['javascript', 'frontend', 'web-development', 'programming']
  },
  {
    title: 'Python for Technical Interviews',
    description: 'Master Python programming concepts and problem-solving techniques for coding interviews.',
    tags: ['python', 'programming', 'interview-prep', 'problem-solving']
  },
  {
    title: 'Database Design and SQL',
    description: 'Learn database design principles, normalization, and advanced SQL queries for technical interviews.',
    tags: ['database', 'sql', 'data-modeling', 'backend']
  },
  {
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning algorithms and their applications in software engineering.',
    tags: ['machine-learning', 'ai', 'data-science', 'algorithms']
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