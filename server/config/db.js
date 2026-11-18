import mongoose from "mongoose";
import "colors";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoBD Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    process.exit(1);
  }
};
