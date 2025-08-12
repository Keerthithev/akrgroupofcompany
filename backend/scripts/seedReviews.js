const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Import existing models
const Room = require('../models/Room');
const Review = require('../models/Review');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample reviews data
const sampleReviews = [
  // Positive Reviews
  {
    roomName: "Business Double Room",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    rating: 5,
    review: "Excellent stay! The room was spacious, clean, and had all the amenities I needed for my business trip. The staff was very helpful and the location is perfect for meetings in the city center.",
    stayDate: new Date('2024-12-15')
  },
  {
    roomName: "Business Double Room",
    customerName: "Michael Chen",
    customerEmail: "michael.chen@email.com",
    rating: 5,
    review: "Perfect business accommodation. Fast WiFi, comfortable work desk, and great room service. The breakfast was delicious and the staff went above and beyond to make my stay comfortable.",
    stayDate: new Date('2024-12-10')
  },
  {
    roomName: "Business Twin Room",
    customerName: "Emma Rodriguez",
    customerEmail: "emma.rodriguez@email.com",
    rating: 4,
    review: "Very good room for business travelers. Clean, well-maintained, and the twin beds are comfortable. The room has good soundproofing and the amenities are top-notch.",
    stayDate: new Date('2024-12-12')
  },
  {
    roomName: "Economy Double Room",
    customerName: "David Thompson",
    customerEmail: "david.thompson@email.com",
    rating: 4,
    review: "Great value for money! The room was clean and comfortable. Perfect for budget-conscious travelers who still want quality accommodation. Staff was friendly and helpful.",
    stayDate: new Date('2024-12-08')
  },
  {
    roomName: "Economy Single Room",
    customerName: "Lisa Wang",
    customerEmail: "lisa.wang@email.com",
    rating: 4,
    review: "Perfect for solo travelers. The room is compact but well-designed. Clean bathroom, comfortable bed, and good location. Would definitely stay here again.",
    stayDate: new Date('2024-12-14')
  },
  {
    roomName: "First-Class Deluxe Room",
    customerName: "Robert Anderson",
    customerEmail: "robert.anderson@email.com",
    rating: 5,
    review: "Absolutely luxurious! The deluxe room exceeded all expectations. Premium amenities, stunning city view, and impeccable service. Worth every penny for a special occasion.",
    stayDate: new Date('2024-12-05')
  },
  {
    roomName: "First-Class Suite",
    customerName: "Jennifer Martinez",
    customerEmail: "jennifer.martinez@email.com",
    rating: 5,
    review: "Exceptional experience! The suite is magnificent with separate living area, premium furnishings, and amazing views. The service is world-class and the attention to detail is impressive.",
    stayDate: new Date('2024-12-03')
  },

  // Neutral Reviews
  {
    roomName: "Business Double Room",
    customerName: "Alex Turner",
    customerEmail: "alex.turner@email.com",
    rating: 3,
    review: "The room was adequate for my business needs. Clean and functional, though the view could be better. Staff was polite but not particularly warm. Overall, it served its purpose.",
    stayDate: new Date('2024-12-07')
  },
  {
    roomName: "Business Twin Room",
    customerName: "Maria Garcia",
    customerEmail: "maria.garcia@email.com",
    rating: 3,
    review: "Standard business accommodation. The room was clean and the beds were comfortable. WiFi worked fine. Nothing exceptional, but nothing wrong either. Met my basic requirements.",
    stayDate: new Date('2024-12-09')
  },
  {
    roomName: "Economy Double Room",
    customerName: "James Wilson",
    customerEmail: "james.wilson@email.com",
    rating: 3,
    review: "Decent room for the price. Basic amenities are provided and the room was clean. Location is convenient. It's what you'd expect for an economy room - functional but not luxurious.",
    stayDate: new Date('2024-12-11')
  },
  {
    roomName: "Economy Single Room",
    customerName: "Amanda Lee",
    customerEmail: "amanda.lee@email.com",
    rating: 3,
    review: "Small but sufficient for a single traveler. The room was clean and the bed was comfortable. Basic amenities provided. Good for a short stay on a budget.",
    stayDate: new Date('2024-12-13')
  },
  {
    roomName: "First-Class Deluxe Room",
    customerName: "Christopher Brown",
    customerEmail: "christopher.brown@email.com",
    rating: 4,
    review: "Nice room with good amenities. The deluxe features are present but not as impressive as expected for the price point. Service was good but not exceptional. Overall satisfactory.",
    stayDate: new Date('2024-12-06')
  },
  {
    roomName: "First-Class Suite",
    customerName: "Nicole Taylor",
    customerEmail: "nicole.taylor@email.com",
    rating: 4,
    review: "Good suite with spacious layout and premium features. The amenities are high-quality and the service is professional. However, the price is quite high for what's offered.",
    stayDate: new Date('2024-12-04')
  }
];

async function seedReviews() {
  try {
    console.log('🌱 Starting to seed reviews...');

    // Get all rooms to match room names with IDs
    const rooms = await Room.find({});
    
    console.log(`Found ${rooms.length} rooms in the database`);

    // Create reviews with proper room IDs
    const reviewsToInsert = [];
    
    for (const review of sampleReviews) {
      const room = rooms.find(r => r.name === review.roomName);
      if (room) {
        reviewsToInsert.push({
          ...review,
          roomId: room._id
        });
      } else {
        console.log(`⚠️  Room not found: ${review.roomName}`);
      }
    }

    // Insert reviews
    const result = await Review.insertMany(reviewsToInsert);
    console.log(`✅ Successfully seeded ${result.length} reviews`);

    // Update room ratings and review counts
    for (const room of rooms) {
      const roomReviews = await Review.find({ roomId: room._id });
      if (roomReviews.length > 0) {
        const avgRating = roomReviews.reduce((sum, review) => sum + review.rating, 0) / roomReviews.length;
        await Room.findByIdAndUpdate(room._id, {
          rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          reviewCount: roomReviews.length
        });
        console.log(`📊 Updated ${room.name}: ${avgRating.toFixed(1)} ⭐ (${roomReviews.length} reviews)`);
      }
    }

    console.log('🎉 Review seeding completed successfully!');
    
    // Display summary
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    console.log(`\n📈 Summary:`);
    console.log(`Total Reviews: ${totalReviews}`);
    console.log(`Average Rating: ${avgRating[0]?.avgRating.toFixed(1) || 0} ⭐`);

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedReviews(); 