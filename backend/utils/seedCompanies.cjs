const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Company = require('../models/Company.cjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const companies = [
  {
    name: 'AKR & SONS (PVT) LTD',
    description: 'Premium Motorcycles and Vehicle Management',
  },
  {
    name: 'AKR Multi Complex',
    description: 'Modern commercial and residential complex offering premium spaces for businesses and families with state-of-the-art facilities and services.'
  },
  {
    name: 'AKR Construction',
    description: 'Professional construction company delivering high-quality infrastructure projects, residential complexes, and commercial buildings with innovative designs.'
  },
  {
    name: 'AKR Lanka Filling Station',
    description: 'Reliable fuel station providing quality petroleum products and automotive services to meet all your vehicle maintenance needs.'
  },
  {
    name: 'AKR Wine Store',
    description: 'Premium wine retail store offering carefully curated selection of finest wines from around the world for connoisseurs and enthusiasts.'
  },
  {
    name: 'AKR Farm',
    description: 'Sustainable agricultural enterprise focusing on organic farming practices and fresh produce cultivation using modern farming techniques.'
  },
  {
    name: "AKR'S Amma Organization",
    description: 'Dedicated social organization committed to community development, charitable activities, and supporting underprivileged families in society.'
  },
  {
    name: 'AKR Easy Credit (Pvt) Ltd',
    description: 'Reliable financial services provider offering easy credit solutions, personal loans, and flexible payment options to meet diverse financial needs.'
  }
];

const seedCompanies = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  for (const c of companies) {
    const exists = await Company.findOne({ name: c.name });
    if (!exists) {
      await Company.create(c);
      console.log(`Seeded: ${c.name}`);
    } else {
      console.log(`Exists: ${c.name}`);
    }
  }
  mongoose.disconnect();
};

seedCompanies(); 