const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student-dash', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkYashUsers() {
  try {
    console.log('Searching for all Yash-related users...\n');
    
    // Search for users with username containing "yash"
    const yashUsers = await User.find({ 
      $or: [
        { username: { $regex: /yash/i } },
        { email: { $regex: /yash/i } }
      ]
    });
    
    console.log(`Found ${yashUsers.length} users with "yash" in username or email:`);
    console.log('='.repeat(60));
    
    yashUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username || 'undefined'}"`);
      console.log(`   Email: "${user.email}"`);
      console.log(`   Role: "${user.role}"`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Password Hash exists: ${!!user.passwordHash}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    // Also check for any users with "test" in their email
    console.log('\nSearching for users with "test" in email...\n');
    const testUsers = await User.find({ email: { $regex: /test/i } });
    
    console.log(`Found ${testUsers.length} users with "test" in email:`);
    console.log('='.repeat(60));
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username || 'undefined'}"`);
      console.log(`   Email: "${user.email}"`);
      console.log(`   Role: "${user.role}"`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user._id}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    // Show all users to see the complete picture
    console.log('\nALL USERS in database:\n');
    const allUsers = await User.find({}).sort({ createdAt: -1 });
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. "${user.username || 'undefined'}" | "${user.email}" | ${user.role} | ${user.createdAt}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking users:', error);
    mongoose.connection.close();
  }
}

checkYashUsers();