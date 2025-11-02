// Direct database promotion script
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function promoteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'yash@test.com' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log('✅ User promoted to admin:');
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('\nNow you can login to admin with:');
      console.log('Email: yash@test.com');
      console.log('Password: password123');
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

promoteUser();