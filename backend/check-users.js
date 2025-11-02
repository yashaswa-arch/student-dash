const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student-dash', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkUsers() {
  try {
    console.log('Checking all users in database...\n');
    
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log(`Found ${users.length} users:`);
      console.log('================================');
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   ID: ${user._id}`);
        console.log('   ----------------------------');
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking users:', error);
    mongoose.connection.close();
  }
}

checkUsers();