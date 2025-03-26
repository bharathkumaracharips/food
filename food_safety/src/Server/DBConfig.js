import mongoose from "mongoose";

const connectToMongoDB = async (mongoURL) => {

  try {
    if (!mongoURL) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(mongoURL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    setTimeout(connectToMongoDB, 5000);
  }
};
export default connectToMongoDB ;
