const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Item = require('../models/Item');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/akr-construction', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const customers = [
  {
    name: 'keerthigan',
    phone: '0778043115',
    address: 'Main Street, Murunkan, Mannar',
    email: 'keerthigan@construction.com',
    creditLimit: 20000,
    status: 'active'
  },
  {
    name: 'John Construction Co.',
    phone: '0771234567',
    address: '123 Main Street, Colombo',
    email: 'john@construction.com',
    creditLimit: 50000,
    status: 'active'
  },
  {
    name: 'ABC Builders Ltd.',
    phone: '0772345678',
    address: '456 Construction Road, Kandy',
    email: 'info@abcbuilders.com',
    creditLimit: 75000,
    status: 'active'
  },
  {
    name: 'Mega Projects',
    phone: '0773456789',
    address: '789 Project Avenue, Galle',
    email: 'contact@megaprojects.com',
    creditLimit: 100000,
    status: 'active'
  },
  {
    name: 'City Developers',
    phone: '0774567890',
    address: '321 Development Lane, Negombo',
    email: 'hello@citydevelopers.com',
    creditLimit: 60000,
    status: 'active'
  },
  {
    name: 'Rural Construction',
    phone: '0775678901',
    address: '654 Village Road, Anuradhapura',
    email: 'info@ruralconstruction.com',
    creditLimit: 40000,
    status: 'active'
  }
];

const items = [
  {
    name: 'Sand',
    category: 'construction',
    unit: 'tons',
    pricePerUnit: 2500,
    description: 'Fine construction sand'
  },
  {
    name: 'Salli (Gravel)',
    category: 'construction',
    unit: 'tons',
    pricePerUnit: 3000,
    description: 'Construction gravel/salli'
  },
  {
    name: 'Cement',
    category: 'construction',
    unit: 'bags',
    pricePerUnit: 1200,
    description: 'Portland cement 50kg bags'
  },
  {
    name: 'Bricks',
    category: 'construction',
    unit: 'pieces',
    pricePerUnit: 25,
    description: 'Standard construction bricks'
  },
  {
    name: 'Steel Bars',
    category: 'construction',
    unit: 'kg',
    pricePerUnit: 180,
    description: 'Reinforcement steel bars'
  },
  {
    name: 'Timber',
    category: 'construction',
    unit: 'cubic feet',
    pricePerUnit: 4500,
    description: 'Construction grade timber'
  },
  {
    name: 'Paint',
    category: 'supplies',
    unit: 'liters',
    pricePerUnit: 800,
    description: 'Interior/exterior paint'
  },
  {
    name: 'Tiles',
    category: 'construction',
    unit: 'square feet',
    pricePerUnit: 150,
    description: 'Floor and wall tiles'
  }
];

async function seedData() {
  try {
    console.log('Starting to seed customers and items...');
    
    // Clear existing data
    await Customer.deleteMany({});
    await Item.deleteMany({});
    
    // Insert customers
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`Created ${createdCustomers.length} customers`);
    
    // Insert items
    const createdItems = await Item.insertMany(items);
    console.log(`Created ${createdItems.length} items`);
    
    console.log('Seeding completed successfully!');
    
    // Display created data
    console.log('\nCustomers:');
    createdCustomers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.phone})`);
    });
    
    console.log('\nItems:');
    createdItems.forEach(item => {
      console.log(`- ${item.name} (${item.unit}) - Rs. ${item.pricePerUnit}`);
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
