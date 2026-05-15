import mongoose from "mongoose";

const DB_NAME = "vehicle_rental";

const buildMongoUri = (rawUri) => {
  const uri = rawUri?.trim();

  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      'Invalid MONGODB_URI. It must start with "mongodb://" or "mongodb+srv://"'
    );
  }

  const [baseWithoutQuery, query = ""] = uri.split("?");
  const normalizedBase = baseWithoutQuery.replace(/\/+$/, "");
  const hasDatabaseName = /\/[^/]+$/.test(normalizedBase.replace(/^(mongodb(\+srv)?:\/\/)/, ""));

  if (hasDatabaseName) {
    return uri;
  }

  const withDatabase = `${normalizedBase}/${DB_NAME}`;
  return query ? `${withDatabase}?${query}` : withDatabase;
};

const connectDB = async () => {
  try {
    const mongoUri = buildMongoUri(process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(
      mongoUri,
      {
        // recommended Atlas options
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    console.log(
      `\n✅ MongoDB Atlas connected — host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
