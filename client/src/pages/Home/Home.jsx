import React from 'react';

import './Home.css';

const Home = ({ createRoom }) => {
  return (
    <div className="Home">
      <h1>Title</h1>
      <button onClick={createRoom}>Create a room</button>
    </div>
  );
};

export default Home;
