import React, { useEffect, useState } from 'react';
import './PointingRoom.css';

const PointingRoom = ({
  myId,
  room,
  clearPoints,
  findRoom,
  joinRoom,
  revealPoints,
  updatePoints,
  setMyId,
}) => {
  const [userName, setUserName] = useState('');
  const [roomPath, setRoomPath] = useState(null);

  useEffect(() => {
    const pathName = window.location.pathname;
    const urlRoomId = pathName ? pathName.split('/')[2] : null;

    if (!urlRoomId) {
      return console.error('Room ID not found');
    }

    const userId = JSON.parse(sessionStorage.getItem('myId'))?.userId;
    setRoomPath(window.location.href);

    if (userId) {
      setMyId(userId);
    }

    findRoom(urlRoomId);
  }, [findRoom, setMyId]);

  const onSubmitName = (e) => {
    e.preventDefault();
    joinRoom({ name: userName, userId: myId });
  };

  const onPointsClick = (e) => {
    e.preventDefault();
    updatePoints(e.target.value);
  };

  const onReveal = (e) => {
    e.preventDefault();
    revealPoints();
  };

  const onReset = (e) => {
    e.preventDefault();
    clearPoints();
  };

  const nameFormJSX = !myId ? (
    <form onSubmit={onSubmitName}>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button type="submit">Add Name</button>
    </form>
  ) : null;
  const roomPathJSX = roomPath ? <p>Room Link: {roomPath}</p> : null;
  const pointButtonsJSX = myId ? (
    <div>
      <input type="button" onClick={onPointsClick} value={'0'} />
      <input type="button" onClick={onPointsClick} value={'1'} />
      <input type="button" onClick={onPointsClick} value={'2'} />
      <input type="button" onClick={onPointsClick} value={'3'} />
      <input type="button" onClick={onPointsClick} value={'5'} />
      <input type="button" onClick={onPointsClick} value={'8'} />
      <input type="button" onClick={onPointsClick} value={'13'} />
      <input type="button" onClick={onPointsClick} value={'21'} />
      <input type="button" onClick={onPointsClick} value={'100'} />
      <input type="button" onClick={onPointsClick} value={'?'} />
    </div>
  ) : null;
  const playersListJSX = myId
    ? room?.users.map((user) => (
        <div key={user.userId}>
          <span>{user.points ? '[v]' : '[]'}</span>
          <span>{user.name}</span>
          <span>{room?.isRevealed ? user.points : 'X'}</span>
        </div>
      ))
    : null;
  const actionButtonsJSx = myId ? (
    <div>
      <button onClick={onReveal}>Reveal</button>
      <button onClick={onReset}>Reset</button>
    </div>
  ) : null;

  return (
    <div className="PointingRoom">
      <h1>Pointing Room</h1>
      {nameFormJSX}
      {playersListJSX}
      {pointButtonsJSX}
      {actionButtonsJSx}
      {roomPathJSX}
    </div>
  );
};

export default PointingRoom;
