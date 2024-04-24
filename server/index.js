import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import logger from './logger.js';
import * as roomEvents from './room.js';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

const PORT = 4000;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('create-room', () => {
    const room = roomEvents.createRoom();
    socket.join(room.roomId);

    logger.info(`Room created: ${room.roomId}`);
    io.to(room.roomId).emit('room-update', room);
  });

  socket.on('join-room', (roomId, userName) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    socket.join(roomId);
    const user = {
      userId: socket.id,
      name: userName,
      points: undefined,
    };
    const updatedRoom = roomEvents.joinRoom(roomId, user);

    logger.info(`User ${user.name}, ${user.userId} joined room ${roomId}`);
    socket.emit('my-info', user);
    io.to(roomId).emit('room-update', updatedRoom);
  });

  socket.on('leave-room', (roomId, userId) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    const updatedRoom = roomEvents.leaveRoom(roomId, userId);

    socket.emit('my-info', null);
    io.to(roomId).emit('room-update', updatedRoom);

    socket.leave(roomId);
    logger.info(`User ${userId} left room ${roomId}`);
  });

  socket.on('find-room', (roomId) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    logger.info(`Room found: ${roomId}`);
    socket.emit('room-update', room);
  });

  socket.on('update-points', (roomId, userId, points) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    const updatedRoom = roomEvents.updatePoints(roomId, userId, points);

    logger.info(`User ${userId} updated points to ${points} in ${roomId}`);
    io.to(roomId).emit('room-update', updatedRoom);
  });

  socket.on('reveal-points', (roomId) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    const updatedRoom = roomEvents.revealPoints(roomId);

    logger.info(`Points revealed in room ${roomId}`);
    io.to(roomId).emit('room-update', updatedRoom);
  });

  socket.on('clear-points', (roomId) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    const updatedRoom = roomEvents.clearPoints(roomId);

    logger.info(`Points cleared in room ${roomId}`);
    io.to(roomId).emit('room-update', updatedRoom);
  });
});
