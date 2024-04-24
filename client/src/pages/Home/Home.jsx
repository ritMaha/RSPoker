import React from 'react';

import './Home.css';

const Home = ({ createRoom }) => {
  return (
    <div className="home">
      <h1>RS Dev Tools</h1>
      <p>Planning Poker Room</p>
      <button className="pokerCreateButton" onClick={createRoom}>
        Create a room
      </button>
    </div>
  );
};

export default Home;
