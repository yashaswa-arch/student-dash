const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student-dash', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkUdayUser() {
  try {
    console.log('Searching for Uday user...\n');
    
    // Search for users with username "uday"
    const udayUsers = await User.find({ username: 'uday' });
    
    if (udayUsers.length === 0) {
      console.log('No users found with username "uday"');
      
      // Search for users with email containing "uday"
      const udayEmailUsers = await User.find({ email: { $regex: /uday/i } });
      if (udayEmailUsers.length > 0) {
        console.log('Found users with "uday" in email:');
        udayEmailUsers.forEach((user, index) => {
          console.log(`${index + 1}. Username: ${user.username || 'undefined'}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Created: ${user.createdAt}`);
          console.log(`   ID: ${user._id}`);
          console.log(`   Password Hash exists: ${!!user.passwordHash}`);
          console.log('   ----------------------------');
        });
      } else {
        console.log('No users found with "uday" in email either');
      }
    } else {
      console.log(`Found ${udayUsers.length} users with username "uday":`);
      udayUsers.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Password Hash exists: ${!!user.passwordHash}`);
        console.log('   ----------------------------');
      });
    }
    
    // Also show the total count and most recent users
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).select('username email role createdAt');
    
    console.log(`\nTotal users in database: ${totalUsers}`);
    console.log('\nMost recent 5 users:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username || 'undefined'} (${user.email}) - ${user.role} - ${user.createdAt}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking Uday user:', error);
    mongoose.connection.close();
  }
}

checkUdayUser();