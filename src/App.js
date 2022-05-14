import React, { useState } from 'react';
import LandingPage from './LandingPage';
import './App.css';
import ChatPage from './ChatPage';

function App() {

  const [appState, setAppState] = useState(0);

  if (appState === 0) {

    return (
      <div className="App">
        <LandingPage setAppState={setAppState} />
      </div>
    );

  } else if (appState === 1) {

    return (
      <div className="App">
        <ChatPage setAppState={setAppState} />
      </div>
    );

  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>odeus.</h1>
      </header>

      <div className="create-room-container">
      
      </div>

    </div>
  );
}

export default App;
