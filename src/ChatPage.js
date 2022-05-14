import React, { useState } from 'react';
import { createOffer, 
         receivedOffer, 
         receivedAnswer, 
         receivedIceCandidate } from './controller/RTC_Connections';


function TextBar() {
    const [message, setMessage] = useState('');
    
    const onSend = () => {
        if(message === "") return;
        for(let id in window.rtc_connections) {
            const pc = window.rtc_connections[id];
            const myChannel = pc.myChannel;
            myChannel.send(JSON.stringify({id:window.ws.meta.id, name:window.ws.meta.name, message}));
        }
        setMessage('');
    }

    return (
        <div className="text-input-container">
            <input type="text" placeholder="Type your message here" onChange={(e)=>setMessage(e.target.value)} value={message}/>
            <button onClick={onSend}>Send</button>
        </div>
    )

}

export default function ChatPage({ setAppState }) {

    window.socketEvents.on('server:member-list', (payload, socket) => {
        const {members} = payload;
        for (const {id, name} of members) {
            createOffer(id, name);
        }
    });

    window.socketEvents.on('server:deliver-offer', (payload, socket) => {
        const {offer, sender_data} = payload;
        const {id, name} = sender_data;
        receivedOffer(offer, id, name);
    });

    window.socketEvents.on('server:deliver-answer', (payload, socket) => {
        const {answer, sender_data} = payload;
        const {id, name} = sender_data;
        receivedAnswer(answer, id, name);
    });

    window.socketEvents.on('server:deliver-ice-candidate', (payload, socket) => {
        const {candidate, sender_data} = payload;
        const {id, name} = sender_data;
        console.log("Received ice candidate from ", id);
        receivedIceCandidate(candidate, id);
    });

    const [name, setName] = useState('');


        return (
            <div className="chat-page-container">
                <h1>Chat Page</h1>

                <TextBar />
            </div>
        )
}