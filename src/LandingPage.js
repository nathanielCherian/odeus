import React, { useState } from 'react';
import { join_room, request_member_list } from './controller/events';

export default function LandingPage({ setAppState }) {

    const [name, setName] = useState('');

    const successful_join_room = () => {
        request_member_list();
        setName('');
        setAppState(1);
    }

    window.socketEvents.on('server:join-room-status', (payload, socket) => {
        const {status} = payload;
        console.log("joinRoomRequest-status: ", status);
        successful_join_room();
    });

    const validate_name = () => {
        if(name === '') return;
        if(name.length > 15) return;
        join_room(name);
    }


    return (
        <div className="landing-page-container">
            <h1>Landing Page</h1>
            <input type="text" placeholder="What should we call you" value={name} onChange={(e)=>setName(e.target.value)}/>
            <button onClick={validate_name}>Join a room</button>
        </div>
    )
}