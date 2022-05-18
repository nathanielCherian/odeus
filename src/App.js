import React, { useState } from 'react';
import LandingPage from './LandingPage';
import './css/App.css';
import ChatPage from './ChatPage';

function App() {

  const [appState, setAppState] = useState(0);


  const getAppView = (appState) => {
    if (appState === 0) {
      return <LandingPage setAppState={setAppState} />;
    } else if (appState === 1) {
      return <ChatPage setAppState={setAppState} />;
    }
    return <></>
  }

  return (
    <div className="App">
      {getAppView(appState)}

      <div className='noti__container noti-error hidden'>
        <p>THIS IS AN ERROR MESSAGE</p>
      </div>

    </div>
  )
  
}


export default App;

