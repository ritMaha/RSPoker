import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { Home, ErrorPage, PointingRoom } from '../';
import { socket } from '../../socket';

const App = () => {
  const navigate = useNavigate();

  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const onConnect = () => {
      setIsSocketOpen(true);
    };

    const onDisconnect = () => {
      setIsSocketOpen(false);
    };

    const onRoomUpdate = (room) => {
      console.log('new room data', room);
      setRoom(room);
    };

    const onMyInfo = (info) => {
      console.log('My info', info);
      setMyId(info?.userId);
    };

    const onSocketError = (data) => {
      console.error(data.error);
      setError(data.error);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-update', onRoomUpdate);
    socket.on('my-info', onMyInfo);
    socket.on('error', onSocketError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room-update', onRoomUpdate);
      socket.off('my-info', onMyInfo);
      socket.off('error', onSocketError);
    };
  }, []);

  const onCreateRoom = () => {
    if (!isSocketOpen) {
      console.warn('Socket is not connected');
      return;
    }

    socket.emit('create-room');
    navigate(`/room/${room?.roomId}`);
  };

  const onJoinRoom = (userName) => {
    if (!isSocketOpen || !room?.roomId || !userName) {
      console.log('Socket is not connected');
      return;
    }

    socket.emit('join-room', room.roomId, userName);
  };

  useEffect(() => {
    if (room?.roomId) {
      navigate(`/room/${room.roomId}`);
    }
  }, [navigate, room?.roomId]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home createRoom={onCreateRoom} />} />
        <Route
          path="/room/:roomId"
          element={
            <PointingRoom room={room} joinRoom={onJoinRoom} myId={myId} />
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
