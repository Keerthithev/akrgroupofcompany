const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle.cjs');
require('dotenv').config();

const COMPANY_ID = '686e05c8f245342ad54d6eb9'; // AKR & SONS (PVT) LTD

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const result = await Vehicle.updateMany(
    { $or: [ { company: { $exists: false } }, { company: { $ne: COMPANY_ID } } ] },
    { $set: { company: COMPANY_ID } }
  );

  console.log(`Updated ${result.modifiedCount || result.nModified || 0} vehicles.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 