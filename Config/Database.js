const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(colors.bgCyan('Database connected successfully'));
  } catch (error) {
    console.error(colors.bgRed('Error connecting to the database:'), error.message);
  
  }
};


