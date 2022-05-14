import React, { useState } from 'react';
import LandingPage from './LandingPage';
import './App.css';

function App() {

  const [appState, setAppState] = useState(0);

  if (appState === 0) {

    return (
      <div className="App">
        <LandingPage setAppState={setAppState} />
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
