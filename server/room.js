import { v4 as uuid4 } from 'uuid';

const rooms = {
  room1: {
    roomID: 'room1',
    users: [
      { userID: 'user1', name: 'User 1', points: 1 },
      { userID: 'user2', name: 'User 2', points: undefined },
    ],
    isRevealed: false,
  },
};

const findRoom = (roomID) => {
  const room = rooms[roomID];

  if (!room) {
    throw new Error('Room not found');
  }

  return room;
};

const createRoom = () => {
  let roomId;

  while (true) {
    roomId = uuid4();
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
  const usersInRoom = room.users.map((user) => user.userID);

  if (usersInRoom.includes(user.userID)) return;

  room.users.push(user);
  return room;
};

const leaveRoom = (roomID, userID) => {
  const room = findRoom(roomID);
  room.users = room.users.filter((user) => user.userID !== userID);

  if (room.users.length === 0) {
    deleteRoom(roomID);
    return;
  }

  return room;
};

const updatePoints = (roomID, userID, points) => {
  const room = findRoom(roomID);
  const user = room.users.find((user) => user.userID === userID);

  if (!user) return;

  user.points = points;
  return room;
};

const clearPoints = (roomID) => {
  const room = findRoom(roomID);
  room.users.forEach((user) => (user.points = undefined));
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
