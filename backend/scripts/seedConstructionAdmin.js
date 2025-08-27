const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ConstructionAdmin = require('../models/ConstructionAdmin');
require('dotenv').config();

async function seedConstructionAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await ConstructionAdmin.findOne({ username: 'construction' });
    if (existingAdmin) {
      console.log('Construction admin already exists');
      process.exit(0);
    }

    // Create new admin
    const passwordHash = await bcrypt.hash('construction123', 10);
    const admin = new ConstructionAdmin({
      username: 'construction',
      passwordHash: passwordHash,
      role: 'construction_admin'
    });

    await admin.save();
    console.log('Construction admin created successfully');
    console.log('Username: construction');
    console.log('Password: construction123');
    
  } catch (error) {
    console.error('Error seeding construction admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedConstructionAdmin(); 