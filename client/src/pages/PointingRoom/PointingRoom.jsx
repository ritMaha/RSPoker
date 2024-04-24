import React, { useEffect, useState } from 'react';
import './PointingRoom.css';

const POINTS = ['0', '1', '2', '3', '5', '8', '13', '21', '100', '?'];

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
  const [isCopied, setIsCopied] = useState(false);

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

  const onLinkClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(roomPath);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const nameFormJSX = !myId ? (
    <form onSubmit={onSubmitName}>
      <input
        className="nameInput"
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button className="nameSubmitButton" type="submit">
        Add Name
      </button>
    </form>
  ) : null;
  const roomPathJSX = roomPath ? (
    <div className="roomLink">
      <span>Room Link:</span>
      <span className="link" onClick={onLinkClick}>
        {roomPath}
      </span>
      {isCopied ? <div className="copied">Link Copied!!</div> : null}
    </div>
  ) : null;
  const pointButtonsJSX = myId ? (
    <div className="pointsButtonWrapper">
      {POINTS.map((point, idx) => (
        <input
          key={`point-${idx}`}
          className="pointsButton"
          type="button"
          onClick={onPointsClick}
          value={point}
        />
      ))}
    </div>
  ) : null;
  const playersListJSX = myId ? (
    <div className="userListWrapper">
      {room?.users.map((user) => (
        <div key={user.userId} className="userList">
          <span className="userPointed">{user.points ? '[v]' : '[]'}</span>
          <span className="userName">{user.name}</span>
          <span className="userPoints">
            {room?.isRevealed ? user.points : 'X'}
          </span>
        </div>
      ))}
    </div>
  ) : null;
  const actionButtonsJSx = myId ? (
    <div className="actionButtonWrapper">
      <button className="actionButton" onClick={onReveal}>
        Reveal
      </button>
      <button className="actionButton" onClick={onReset}>
        Reset
      </button>
    </div>
  ) : null;

  return (
    <div className="pointingRoom">
      <h1>RS Poker</h1>
      {nameFormJSX}
      {playersListJSX}
      {pointButtonsJSX}
      {actionButtonsJSx}
      {roomPathJSX}
    </div>
  );
};

export default PointingRoom;
