import React, { useState, useEffect } from 'react';
import { TextInput } from './Components';
import { createOffer, 
         receivedOffer, 
         receivedAnswer, 
         receivedIceCandidate } from './controller/RTC_Connections';


function MessageBox() {

    const [messages, setMessages] = useState([]);

    window.addMessage = (message) => {
        setMessages(messages.concat(message));
    }

    return (
        <div className="message-container" style={{ display:"flex", justifyContent:"center"}}>
            <div className="message-box" style={{"width":"300px", textAlign:"left"}}>
                {messages.map((message, index) => {

                    if(message.type === "message") {
                        return (
                            <div key={index} className="message-line">
                                <span className='message-line__name' style={{"paddingRight":"10px"}}>
                                    { 
                                        message.id !== window.ws.meta.id ? <b>{message.name}:</b> : <b><i>you:</i></b>
                                    }
                                </span>
                                <span>{message.message}</span>
                            </div>
                        )
                    }

                    if(message.type === "notification") {
                        return (
                            <div key={index} className="message-line">
                                <span style={{"color":"gray"}}><i>{message.message}</i></span>
                            </div>
                        )
                    }

                })}
            </div>
        </div>

    )

}

function TextBar() {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lastStroke, setLastStroke] = useState(0);
    const [time, setTime] = useState(0);
    
    if(time - lastStroke > 1000) { // the difference between now and last stroke
        console.log("not typing");
    } else {
        console.log("typing");
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 1000);
    }, [])

    const onSend = () => {
        if(message === "") return;
        const m = {id:window.ws.meta.id, name:window.ws.meta.name, message, type:'message'};
        for(let id in window.rtc_connections) {
            const pc = window.rtc_connections[id];
            const myChannel = pc.myChannel;
            myChannel.send(JSON.stringify(m));
        }
        window.addMessage(m);
        setMessage('');
    }
    
    const changed = (e) => {
        const now = Date.now();
        setLastStroke(now);
        setMessage(e.target.value);
    }


    return (
        <div className="text-input-container">
            <TextInput placeholder="Type a message" onChange={changed} value={message} onEnter={onSend}/>
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

    return (
        <div className="chat-page-container">
            <h1>Chat Page</h1>
            <MessageBox />
            <TextBar />
        </div>
    )
}