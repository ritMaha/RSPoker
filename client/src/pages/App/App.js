import React, { useCallback, useEffect, useState } from 'react';
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
      sessionStorage.setItem(
        'sockets',
        JSON.stringify({ socketId: socket.id }),
      );

      setIsSocketOpen(true);

      const roomId = JSON.parse(sessionStorage.getItem('room'))?.roomId;
      const userId = JSON.parse(sessionStorage.getItem('myId'))?.userId;
      if (!roomId || !userId) return;

      socket.emit('link-new-socket', roomId, userId);
    };

    const onDisconnect = () => setIsSocketOpen(false);

    const onRoomUpdate = (room) => {
      if (!room) {
        console.error('No Room Data');
        return;
      }

      setRoom(room);
    };

    const onMyInfo = (info) => setMyId(info?.userId);

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

  useEffect(() => {
    const updateSessionId = myId || window.location.pathname === '/';
    if (updateSessionId) {
      sessionStorage.setItem('myId', JSON.stringify({ userId: myId }));
    }
  }, [myId]);

  useEffect(() => {
    const updateSessionRoom = room?.roomId || window.location.pathname === '/';
    if (updateSessionRoom) {
      sessionStorage.setItem('room', JSON.stringify({ roomId: room?.roomId }));
    }

    if (room?.roomId) {
      navigate(`/room/${room?.roomId}`);
    }
  }, [navigate, room?.roomId]);

  const onCreateRoom = () => {
    if (!isSocketOpen) {
      console.warn('Socket is not connected');
      return;
    }

    socket.emit('create-room');
  };

  const onJoinRoom = useCallback(
    (user) => {
      if (!isSocketOpen || !room?.roomId || !user) {
        console.warn('Socket is not connected');
        return;
      }

      socket.emit('join-room', room.roomId, JSON.stringify(user));
    },
    [isSocketOpen, room?.roomId],
  );

  const onFindRoom = useCallback(
    (roomId) => {
      if (!isSocketOpen || !roomId) {
        console.warn('Socket is not connected');
        return;
      }

      socket.emit('find-room', roomId);
    },
    [isSocketOpen],
  );

  const onUpdatePoints = useCallback(
    (points) => {
      if (!isSocketOpen || !room?.roomId || !myId) {
        console.warn('Socket is not connected');
        return;
      }

      socket.emit('update-points', room.roomId, myId, points);
    },
    [isSocketOpen, room?.roomId, myId],
  );

  const onClearPoints = useCallback(() => {
    if (!isSocketOpen || !room?.roomId) {
      console.warn('Socket is not connected');
      return;
    }

    socket.emit('clear-points', room.roomId);
  }, [isSocketOpen, room?.roomId]);

  const onRevealPoints = useCallback(() => {
    if (!isSocketOpen || !room?.roomId) {
      console.warn('Socket is not connected');
      return;
    }

    socket.emit('reveal-points', room.roomId);
  }, [isSocketOpen, room?.roomId]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home createRoom={onCreateRoom} />} />
        <Route
          path="/room/:roomId"
          element={
            <PointingRoom
              myId={myId}
              room={room}
              clearPoints={onClearPoints}
              findRoom={onFindRoom}
              joinRoom={onJoinRoom}
              revealPoints={onRevealPoints}
              updatePoints={onUpdatePoints}
              setMyId={setMyId}
            />
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
