import React, { useState } from 'react';
import './PointingRoom.css';

const PointingRoom = ({ room, joinRoom, myId }) => {
  const [userName, setUserName] = useState('');

  const onSubmitName = (e) => {
    e.preventDefault();
    joinRoom(userName);
  };

  return (
    <div className="PointingRoom">
      <h1>Pointing Room</h1>
      <p>Room Link: {room?.roomId}</p>
      {!myId ? (
        <form onSubmit={onSubmitName}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button type="submit">Add Name</button>
        </form>
      ) : null}
    </div>
  );
};

export default PointingRoom;
