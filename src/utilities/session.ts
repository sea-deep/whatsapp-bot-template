import { env } from "./env";
import { Logger } from "./logger";
import Redis from "ioredis";
import mongoose from "mongoose";

export interface SessionData {
  __scene?: string;
  __cursor?: number;
  [key: string]: any;
}

// Memory Store with TTL (Space Optimization)
class MemoryStore {
  private store = new Map<string, { data: SessionData; expiresAt: number }>();
  private ttl = 1000 * 60 * 60 * 24; // 24 hours

  constructor() {
    // Cleanup interval every 1 hour
    setInterval(() => this.cleanup(), 1000 * 60 * 60);
  }

  async get(key: string): Promise<SessionData> {
    const item = this.store.get(key);
    if (!item) return {};
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return {};
    }
    // Refresh TTL on read
    item.expiresAt = Date.now() + this.ttl;
    return item.data;
  }

  async set(key: string, data: SessionData): Promise<void> {
    this.store.set(key, { data, expiresAt: Date.now() + this.ttl });
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Redis Store
class RedisStore {
  private client: Redis;
  private ttl = 60 * 60 * 24; // 24 hours in seconds

  constructor(url: string) {
    this.client = new Redis(url);
    this.client.on("error", (err) => Logger.error("Redis Session Error", err));
  }

  async get(key: string): Promise<SessionData> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : {};
  }

  async set(key: string, data: SessionData): Promise<void> {
    await this.client.set(key, JSON.stringify(data), "EX", this.ttl);
  }
}

// Mongo Store
const SessionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, expires: '24h', default: Date.now } // TTL index
});
const SessionModel = mongoose.model("Session", SessionSchema);

class MongoStore {
  constructor(url: string) {
    mongoose.connect(url).catch(err => Logger.error("Mongo Session Error", err));
  }

  async get(key: string): Promise<SessionData> {
    const doc = await SessionModel.findOne({ key });
    return doc ? doc.data : {};
  }

  async set(key: string, data: SessionData): Promise<void> {
    await SessionModel.findOneAndUpdate(
      { key },
      { data, createdAt: new Date() }, // update TTL
      { upsert: true, new: true }
    );
  }
}

export class SessionManager {
  private store: MemoryStore | RedisStore | MongoStore;

  constructor() {
    if (env.REDIS_URL) {
      Logger.info("Using Redis for session storage.");
      this.store = new RedisStore(env.REDIS_URL);
    } else if (env.MONGO_URL) {
      Logger.info("Using MongoDB for session storage.");
      this.store = new MongoStore(env.MONGO_URL);
    } else {
      Logger.info("Using Memory Map for session storage (with TTL).");
      this.store = new MemoryStore();
    }
  }

  async get(userId: string): Promise<SessionData> {
    return this.store.get(userId);
  }

  async save(userId: string, data: SessionData): Promise<void> {
    await this.store.set(userId, data);
  }
}

export const sessionManager = new SessionManager();
