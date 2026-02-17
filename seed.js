// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Cab = require('./src/models/Cab');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🌱 Seeding Database...');

    // 1. Create a Dummy User
    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      currentLocation: { coordinates: [72.8777, 19.0760] } // Mumbai Coordinates
    });
    console.log(`✅ Created User: ${user.name} (${user._id})`);

    // 2. Create a Dummy Cab (Near Mumbai Airport)
    const cab = await Cab.create({
      driverName: "Rahul Driver",
      licensePlate: "MH-01-AB-1234",
      capacity: 4,
      currentLocation: { coordinates: [72.8775, 19.0755] }, // Very close to user
      isAvailable: true
    });
    console.log(`✅ Created Cab: ${cab.driverName}`);

    console.log('🚀 Database Seeded! Press Ctrl+C to exit.');
  })
  .catch(err => console.log(err));