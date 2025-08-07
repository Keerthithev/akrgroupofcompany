require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Clear existing products
    await Product.deleteMany({});
    
    const products = [
      {
        name: 'Smartphone X1',
        description: 'Latest smartphone with advanced features and high-quality camera',
        image: '/images/shopping.jpg',
        price: 45000,
        category: 'Electronics'
      },
      {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        image: '/images/shopping.jpg',
        price: 8500,
        category: 'Electronics'
      },
      {
        name: 'Designer T-Shirt',
        description: 'Comfortable cotton t-shirt with modern design',
        image: '/images/shopping.jpg',
        price: 1500,
        category: 'Clothing'
      },
      {
        name: 'Running Shoes',
        description: 'Professional running shoes with excellent comfort and support',
        image: '/images/shopping.jpg',
        price: 3500,
        category: 'Footwear'
      },
      {
        name: 'Laptop Bag',
        description: 'Durable laptop bag with multiple compartments',
        image: '/images/shopping.jpg',
        price: 2500,
        category: 'Accessories'
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health monitoring',
        image: '/images/shopping.jpg',
        price: 12000,
        category: 'Electronics'
      },
      {
        name: 'Denim Jeans',
        description: 'Classic denim jeans with perfect fit',
        image: '/images/shopping.jpg',
        price: 2800,
        category: 'Clothing'
      },
      {
        name: 'Sunglasses',
        description: 'Stylish sunglasses with UV protection',
        image: '/images/shopping.jpg',
        price: 1800,
        category: 'Accessories'
      }
    ];
    
    await Product.insertMany(products);
    console.log('Products seeded successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding products:', error);
    await mongoose.disconnect();
  }
}

main(); 