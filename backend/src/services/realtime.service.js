import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { createSocketCorsOptions } from "../config/cors.js";
import { env } from "../config/env.js";

let io;
const onlineUsers = new Map();

export function initRealtime(server) {
  io = new Server(server, {
    cors: createSocketCorsOptions()
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      extractBearer(socket.handshake.headers?.authorization || "");

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      socket.data.user = jwt.verify(token, env.jwtSecret);
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.data.user.sub);
    socket.join(userRoom(userId));
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    io.emit("presence:update", { userId, isOnline: true });

    socket.on("presence:subscribe", (payload = {}) => {
      const userIds = Array.isArray(payload.userIds) ? payload.userIds.map(String) : [];
      socket.emit("presence:snapshot", {
        items: userIds.map((id) => ({ userId: id, isOnline: isUserOnline(id) }))
      });
    });

    socket.on("conversation:join", (payload = {}) => {
      if (payload.conversationId) {
        socket.join(conversationRoom(String(payload.conversationId)));
      }
    });

    socket.on("conversation:typing", (payload = {}) => {
      const conversationId = String(payload.conversationId || "");
      if (!conversationId) {
        return;
      }

      socket.to(conversationRoom(conversationId)).emit("conversation:typing", {
        conversationId,
        userId,
        isTyping: Boolean(payload.isTyping)
      });
    });

    socket.on("disconnect", () => {
      const nextCount = (onlineUsers.get(userId) || 1) - 1;
      if (nextCount <= 0) {
        onlineUsers.delete(userId);
        io.emit("presence:update", { userId, isOnline: false });
      } else {
        onlineUsers.set(userId, nextCount);
      }
    });
  });

  return io;
}

export function emitCommunityPostCreated(post) {
  io?.emit("community:post-created", post);
}

export function emitCommunityPostUpdated(post) {
  io?.emit("community:post-updated", post);
}

export function emitConversationMessage(conversationId, payload, participantIds = []) {
  io?.to(conversationRoom(conversationId)).emit("conversation:message", payload);
  participantIds.forEach((participantId) => {
    io?.to(userRoom(participantId)).emit("conversation:message", payload);
  });
}

export function getPresenceSnapshot(userIds = []) {
  return userIds.map((userId) => ({
    userId: String(userId),
    isOnline: isUserOnline(userId)
  }));
}

export function isUserOnline(userId) {
  return Boolean(onlineUsers.get(String(userId)));
}

function extractBearer(value) {
  return String(value || "").startsWith("Bearer ") ? String(value).slice(7) : "";
}

function userRoom(userId) {
  return `user:${String(userId)}`;
}

function conversationRoom(conversationId) {
  return `conversation:${String(conversationId)}`;
}
