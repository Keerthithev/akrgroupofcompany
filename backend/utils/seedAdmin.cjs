const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User.cjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const adminExists = await User.findOne({ email: 'admin@akr.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@akr.com',
      password: 'akradmin123',
      isAdmin: true,
    });
    console.log('Admin user seeded');
  } else {
    console.log('Admin user already exists');
  }
  mongoose.disconnect();
};

seedAdmin(); 