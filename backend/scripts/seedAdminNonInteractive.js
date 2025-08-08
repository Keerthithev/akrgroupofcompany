require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'akradmin' });
    if (existingAdmin) {
      console.log('Admin user already exists: akradmin');
      mongoose.disconnect();
      return;
    }

    // Create default admin credentials
    const username = 'akradmin';
    const password = 'akr123456';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const admin = new Admin({ 
      username, 
      passwordHash 
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: akradmin');
    console.log('Password: akr123456');
    console.log('Please change these credentials after first login for security.');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
}

main(); 