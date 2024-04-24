import { v4 as uuid4 } from 'uuid';
import base64url from 'base64url';
import logger from './logger.js';

const rooms = {
  room1: {
    roomID: 'room1',
    users: [
      { userId: 'user1', name: 'User 1', points: 1 },
      { userId: 'user2', name: 'User 2', points: undefined },
    ],
    isRevealed: false,
  },
};

const createID = () => {
  const v4 = uuid4();
  const v4Undecorated = v4.replace(/-/g, '');
  const buffer = Buffer.from(v4Undecorated, 'hex');
  return base64url(buffer);
};

const findRoom = (roomID) => {
  const room = rooms[roomID];

  if (!room) {
    logger.error(`Room Not Found: ${roomID}`);
    return;
  }

  return room;
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

const deleteRoom = (roomID) => delete rooms[roomID];

const joinRoom = (roomID, user) => {
  const room = findRoom(roomID);
  const usersInRoom = room.users.map((user) => user.userId);

  console.log('before', room, usersInRoom, user.userId);
  if (usersInRoom.includes(user.userId)) return;

  room.users.push(user);

  console.log('after', room, usersInRoom, user.userId);
  return room;
};

const leaveRoom = (roomID, userId) => {
  const room = findRoom(roomID);
  room.users = room.users.filter((user) => user.userId !== userId);

  if (room.users.length === 0) {
    deleteRoom(roomID);
    return;
  }

  return room;
};

const updatePoints = (roomID, userId, points) => {
  const room = findRoom(roomID);
  const user = room.users.find((user) => user.userId === userId);

  if (!user) return;

  user.points = points;
  return room;
};

const clearPoints = (roomID) => {
  const room = findRoom(roomID);
  room.users.forEach((user) => (user.points = undefined));
  room.isRevealed = false;

  return room;
};

const revealPoints = (roomID) => {
  const room = findRoom(roomID);
  room.isRevealed = true;

  return room;
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
};
