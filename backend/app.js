const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
// const errorHandler = require('./middleware/errorHandler');
// Only import the new routes
const settingsRoutes = require('./routes/settings');
const roomsRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admin');
const bookingsRoutes = require('./routes/bookings');
const usersRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const productsRoutes = require('./routes/products');

// Load env vars
dotenv.config({ path: './.env' });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  'https://akrsonspvtltd.netlify.app',
  'http://localhost:8080', // your local frontend
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies/auth
}));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productsRoutes);

// Error Handler (uncomment and implement if needed)
// app.use(errorHandler);

module.exports = app;

