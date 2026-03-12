require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});

  await User.create([
    { name: 'Producer User', email: 'producer@ofts.com', password: '123456', role: 'Producer' },
    { name: 'Certifier User', email: 'certifier@ofts.com', password: '123456', role: 'Certifier' },
    { name: 'Distributor User', email: 'distributor@ofts.com', password: '123456', role: 'Distributor' },
    { name: 'Retailer User', email: 'retailer@ofts.com', password: '123456', role: 'Retailer' },
  ]);

  console.log('Seeded users');
  await mongoose.connection.close();
};

seed();
