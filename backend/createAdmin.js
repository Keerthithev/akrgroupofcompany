require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function createAdmin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-group-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB Atlas');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('Password: admin123');
      mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = new Admin({ 
      username: 'admin', 
      passwordHash 
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('You can now login to the admin dashboard');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error);
    mongoose.disconnect();
  }
}

createAdmin(); 