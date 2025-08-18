const express = require('express');
const connectDB = require('./config/db');
const couponRoutes = require('./routes/couponRoutes');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route for the root
app.get('/', (req, res) => {
  res.send('Coupon Microservice is running!');
});

// Use the coupon routes
app.use('/api/coupons', couponRoutes);

// Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
