import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at ${config.server.MONGODB_URI}...`);

    await mongoose.connect(config.server.MONGODB_URI ?? "");

    console.log(" MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message ?? error);
    process.exit(1); 
  }
};

export default connectDB;