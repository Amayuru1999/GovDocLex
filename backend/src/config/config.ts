import dotenv from "dotenv";
dotenv.config();

export interface IServerConfig {
  port: number | string;
  nodeEnv: string;
  MONGODB_URI?: string;
  JWT_SECRET?: string;
}

export const config = {
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  pythonAPI: {
    url: process.env.PYTHON_RAG_API_URL || "http://localhost:8000",
    timeout: parseInt(process.env.PYTHON_RAG_API_TIMEOUT || "30000", 10),
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "15 * 60 * 1000", 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || "25000", 10),
    heartbeatTimeout: parseInt(process.env.WS_HEARTBEAT_TIMEOUT || "60000", 10),
  },

  security: {
    jwtSecret:
      process.env.JWT_SECRET || "your-jwt-secret-key-change-in-production",
    sessionSecret:
      process.env.SESSION_SECRET ||
      "your-session-secret-key-change-in-production",
  },
};
