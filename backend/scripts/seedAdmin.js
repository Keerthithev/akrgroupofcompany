require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  rl.question('Admin username: ', (username) => {
    rl.question('Admin password: ', async (password) => {
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = new Admin({ username, passwordHash });
      await admin.save();
      console.log('Admin user created:', username);
      rl.close();
      mongoose.disconnect();
    });
  });
}

main(); 