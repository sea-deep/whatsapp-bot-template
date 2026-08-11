import { config } from "dotenv";

config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  REDIS_URL: process.env.REDIS_URL || "",
  MONGO_URL: process.env.MONGO_URL || "",
};
