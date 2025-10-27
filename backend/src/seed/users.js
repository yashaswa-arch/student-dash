const bcrypt = require('bcryptjs');
const User = require('../models/User');

const userData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'Instructor123!',
    role: 'instructor'
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@example.com',
    password: 'Instructor123!',
    role: 'instructor'
  },
  {
    name: 'Alice Smith',
    email: 'alice.smith@example.com',
    password: 'Student123!',
    role: 'student'
  },
  {
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    password: 'Student123!',
    role: 'student'
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    password: 'Student123!',
    role: 'student'
  },
  {
    name: 'David Brown',
    email: 'david.brown@example.com',
    password: 'Student123!',
    role: 'student'
  },
  {
    name: 'Eva Garcia',
    email: 'eva.garcia@example.com',
    password: 'Student123!',
    role: 'student'
  }
];

const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      userData.map(async (user) => {
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(user.password, saltRounds);
        
        return {
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role
        };
      })
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Log login credentials for testing
    console.log('\n📋 Test User Credentials:');
    userData.forEach((user) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;