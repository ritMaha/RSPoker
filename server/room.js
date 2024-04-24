import { v4 as uuid4 } from 'uuid';
import base64url from 'base64url';
import logger from './logger.js';

/*
 * room1: {
    roomId: 'room1',
    users: [
      { userId: 'user1', name: 'User 1', points: 1 },
      { userId: 'user2', name: 'User 2', points: undefined },
    ],
    isRevealed: false,
  }
 */
const rooms = {};

/**
 * userId: 'socketId1'
 */
const userSocketMap = {};

/**
 * userId: ['room1']
 */
const userRoomMap = {};

const updateUserSocketMap = (roomId, userId, socketId) => {
  userSocketMap[userId] = socketId;

  if (userRoomMap[userId]) {
    userRoomMap[userId] = [...new Set([...userRoomMap[userId], roomId])];
    return;
  }
  userRoomMap[userId] = [roomId];
};

const createID = () => {
  const v4 = uuid4();
  const v4Undecorated = v4.replace(/-/g, '');
  const buffer = Buffer.from(v4Undecorated, 'hex');
  return base64url(buffer);
};

const createRoom = () => {
  let roomId;
  while (true) {
    roomId = createID();
    if (rooms[roomId]) {
      continue;
    }
    break;
  }

  const newRoom = {
    roomId,
    users: [],
    isRevealed: false,
  };
  rooms[roomId] = newRoom;
  return newRoom;
};

const deleteRoom = (roomId) => delete rooms[roomId];

const joinRoom = (roomId, user) => {
  const room = findRoom(roomId);
  if (!room) return;

  const usersInRoom = room.users.map((user) => user.userId);

  if (usersInRoom.includes(user.userId)) return;

  room.users.push(user);
  return room;
};

const findRoom = (roomId) => {
  const room = rooms[roomId];
  if (!room) {
    logger.error(`Room Not Found: ${roomId}`);
    return;
  }

  return room;
};

const leaveRoom = (roomId, userId) => {
  const room = findRoom(roomId);
  if (!room) return;

  room.users = room.users.filter((user) => user.userId !== userId);

  if (room.users.length === 0) {
    deleteRoom(roomId);
    return;
  }

  return room;
};

const updatePoints = (roomId, userId, points) => {
  const room = findRoom(roomId);
  if (!room) return;

  const user = room.users.find((user) => user.userId === userId);

  if (!user) return;

  user.points = points;
  return room;
};

const clearPoints = (roomId) => {
  const room = findRoom(roomId);
  if (!room) return;

  room.users.forEach((user) => (user.points = undefined));
  room.isRevealed = false;

  return room;
};

const revealPoints = (roomId) => {
  const room = findRoom(roomId);
  if (!room) return;

  room.isRevealed = true;

  return room;
};

const cleanUp = (activeSocketList) => {
  const inactiveUserIdList = [];
  const updatedRoomMaps = {};

  for (const userId in userSocketMap) {
    if (!activeSocketList.includes(userSocketMap[userId])) {
      inactiveUserIdList.push(userId);
    }
  }

  inactiveUserIdList.forEach((userId) => {
    const roomsForUser = userRoomMap[userId];

    if (!roomsForUser?.length) return;

    roomsForUser.forEach((roomId) => {
      logger.info(`User ${userId} left room ${roomId}`);

      const updatedRoom = leaveRoom(roomId, userId);
      updatedRoomMaps[roomId] = updatedRoom;
    });

    delete userSocketMap[userId];
    delete userRoomMap[userId];
  });

  return updatedRoomMaps;
};

export {
  createRoom,
  findRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  updatePoints,
  clearPoints,
  revealPoints,
  updateUserSocketMap,
  cleanUp,
};
