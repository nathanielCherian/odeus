import React, { useState, useEffect } from 'react';
import { TextInput } from './Components';
import { sendData,
         createOffer,
         receivedOffer, 
         receivedAnswer,
         disconnect_all,
         receivedIceCandidate } from './controller/RTC_Connections';


function OptionBar({ leave_chat }) {
    
    return (
        <div className="option-bar">
            <button className="leave-button" onClick={leave_chat}> leave. </button>
        </div>
    )
}

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

function StatusBar() {

    const [typers, setTypers] = useState({})

    window.setPeerStatus = (id_, typingStatus) => {
        typers[id_] = typingStatus
        setTypers({...typers, [id_]:typingStatus})
    };


    const createMessage = (typers) => {
        const typer_ids = Object.keys(typers).filter(id_ => typers[id_]);
        const typer_names = typer_ids.map((id_) => `'${window.rtc_connections[id_].meta.name}'`);
        const action = typer_names.length>0?'are typing':''
        return typer_names.join(' and ') + action;
    }

    return (
        <div>
            <small className='typing-message'>{createMessage(typers)}</small>
        </div>
    )
}

function TextBar() {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lastStroke, setLastStroke] = useState(0);
    const [time, setTime] = useState(0);
    
    const setTyping = (typing) => {
        const m = {id:window.ws.meta.id, name:window.ws.meta.name, isTyping:typing, type:"typing"}
        sendData(m);
        setIsTyping(typing);
    }

    if(time - lastStroke > 1000) { // the difference between now and last stroke
        if(isTyping) setTyping(false);
    } else {
        if(!isTyping) setTyping(true);
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

    const leave_chat = () => {
        disconnect_all();
        window.ws.emit("client:leave-room", {});
        setAppState(0);
    }

    return (
        <div className="chat-page-container">
            <OptionBar leave_chat={leave_chat}/>
            <h1>odeus.</h1>
            <MessageBox />
            <StatusBar />
            <TextBar />
        </div>
    )
}