import mongoose from "mongoose";

type connectionObjectType = {
  isConnected?: number;
};

const connection: connectionObjectType = {};

const dbConnection = async () => {
  try {
    if (connection.isConnected) {
      console.log("Database is already connected");
      return;
    }

    const db = await mongoose.connect(process.env.MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState;

    console.log("Database is connected");
  } catch (error) {
    console.log("Error in dbConnection", error);
    process.exit(1);
  }
};

export default dbConnection;
