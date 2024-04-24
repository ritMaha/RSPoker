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
  logger.info(`User Socket connected: ${socket.id}`);

  socket.on('link-new-socket', (roomId, userId) => {
    if (!roomId || !userId) {
      return socket.emit('error', { error: 'Room ID or User ID not found' });
    }

    roomEvents.updateUserSocketMap(roomId, userId, socket.id);
    socket.join(roomId);
  });

  socket.on('create-room', () => {
    const room = roomEvents.createRoom();
    socket.join(room.roomId);

    logger.info(`Room created: ${room.roomId}`);
    io.to(room.roomId).emit('room-update', room);
  });

  socket.on('join-room', (roomId, data) => {
    const room = roomEvents.findRoom(roomId);
    if (!room) {
      return socket.emit('error', { error: 'Room not found' });
    }

    const user = JSON.parse(data);

    socket.join(roomId);
    const newUser = {
      userId: user.userId ?? socket.id,
      name: user.name,
      points: undefined,
    };
    const updatedRoom = roomEvents.joinRoom(roomId, newUser);
    roomEvents.updateUserSocketMap(roomId, newUser.userId, socket.id);

    logger.info(
      `User ${newUser.name}, ${newUser.userId} joined room ${roomId}`,
    );
    socket.emit('my-info', newUser);
    io.to(roomId).emit('room-update', updatedRoom);
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

  socket.on('disconnecting', () => {
    logger.info(`User disconnecting: ${socket.id}`);

    setTimeout(() => {
      const activeSocketList = Array.from(io.sockets.sockets.keys());
      const cleanedRooms = roomEvents.cleanUp(activeSocketList);

      for (const roomId in cleanedRooms) {
        logger.info(`Cleaned room ${roomId}`);
        io.to(roomId).emit('room-update', cleanedRooms[roomId]);
      }
    }, [5000]);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});
