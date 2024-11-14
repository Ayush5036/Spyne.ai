const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;  // Assuming this is defined in your .env file
    if (!dbURI) {
      console.log("MongoDB URI not defined.");
      return;
    }

    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);  // Exit the process with failure
  }
};

module.exports = connectDB;
