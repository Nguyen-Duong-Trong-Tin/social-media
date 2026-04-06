import mongoose from "mongoose";

const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("Connect success.");
  } catch (error) {
    console.log("Connect error.", error);
  }
};

const database = { connect };
export default database;
