import React, { useState } from 'react';
import { join_room } from './controller/events';

export default function LandingPage({ setAppState }) {

    const [name, setName] = useState('');

    const after_join_room = () => {
        setAppState(1);
    }

    return (
        <div className="landing-page-container">
            <h1>Landing Page</h1>
            <input type="text" placeholder="What should we call you" value={name} onChange={(e)=>setName(e.target.value)}/>
            <button onClick={()=>join_room(name, after_join_room)}>Join a room</button>
        </div>
    )
}