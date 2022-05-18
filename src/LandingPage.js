import React, { useState } from 'react';
import { join_room, request_member_list } from './controller/events';
import { TextInput } from './Components';
import './css/LandingPage.css';

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
        <div className="landing-page__container">

            <div className='heading__container'>
                <h1 className="heading__title">odeus.</h1>
                <p className="heading__sub">group chats with strangers</p>
            </div>

            <div className="join-room__container">
                <TextInput placeholder="What should we call you" onChange={(e)=>setName(e.target.value)} value={name} onEnter={validate_name}/>
                <button onClick={validate_name}>Join a room</button>
            </div>
        </div>
    )
}