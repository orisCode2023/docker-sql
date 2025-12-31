import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:password123@localhost:27018/ecommerce?authSource=admin";
const DB_NAME = "ecommerce";
const COLLECTION_NAME = "products"

let mongocClient = null;
let mongoConn = null;

export async function initMongoDb() {
  try {
    mongocClient = new MongoClient(MONGO_URL);
    await mongocClient.connect();
    mongoConn = mongocClient.db(DB_NAME);
    
    const productCollection = mongoConn.collection(COLLECTION_NAME);
    
    // Create the unique index on title
    await productCollection.createIndex({ name : 1 }, { unique: true });
    
    console.log("Database initialized and unique index created on 'name' field");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    await closeConnection();
  }
}

export async function getMongoDb() {
  if (!mongoConn) {
    if (!mongocClient) {
      mongocClient = new MongoClient(MONGO_URL);
      await mongocClient.connect();
    }
    mongoConn = mongocClient.db(DB_NAME);
  }
  return mongoConn;
}

export async function closeConnection() {
  if (mongocClient) {
    await mongocClient.close();
    mongocClient = null;
    mongoConn = null;
  }
}

