import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

export const app = express();
export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL || true,
    credentials: true,
  },
});

// Map to store online users
const userSocketMap = {}; // { userId: socketId }

// Apply authentication middleware
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.user?.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // Send online users list to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.user?.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Helper to get receiver socket id
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
