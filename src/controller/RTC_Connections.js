
const options = {
    iceServers: [
        {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

function createPeerConnection(id, name) {
    const pc = new RTCPeerConnection(options);

    pc.onicecandidate = e => {
        if(!e.candidate) return;
        console.log("created a candidate")
        window.ws.emit('client:send-ice-candidate', {
            candidate: e.candidate,
            partner_id: id // this is the other persons ID, I am naming my connection after them
        });
    };


    window.rtc_connections[id] = pc;
    pc.meta = {id, name};

    const myChannel = pc.createDataChannel('sendDataChannel');
    pc.myChannel = myChannel;
    myChannel.onopen = (e) => {
        console.log(`Data channel with ${id} open...`);
        window.addMessage({type:"notification", message:`'${name}' joined the room` });
    }
    myChannel.onclose = (e) => {
        console.log(`Data channel with ${id} closed...`);
        window.addMessage({type:"notification", message:`'${name}' left the room` });
        delete window.rtc_connections[id];
    }
    

    pc.ondatachannel = e => {
        e.channel.onmessage = e => {
            const d = JSON.parse(e.data);
            if(d['type'] === 'typing') {
                window.setPeerStatus(d.id, d.isTyping);
                return
            }
            const {id, name, message, type} = JSON.parse(e.data);
            
            window.addMessage({id, name, message, type});
        }
    }
    
    return pc;
}

function createOffer(member_id, name) {
    const pc = createPeerConnection(member_id, name);

    pc.createOffer().then(offer => {
        window.ws.emit('client:send-offer', {offer, partner_id:member_id});
        pc.setLocalDescription(new RTCSessionDescription(offer))
    });

    console.log("creaed offer for ", member_id, "alias: " + name);
}

function receivedOffer(offer, sender_id, name) {
    const pc = createPeerConnection(sender_id, name);

    pc.setRemoteDescription(offer).then(() => {
        pc.createAnswer().then(answer => {
            console.log("creating answer for ", sender_id);
            window.ws.emit('client:send-answer', {answer, partner_id:sender_id});
            pc.setLocalDescription(answer);
        });
    });
}

function receivedAnswer(answer, sender_id) {
    const pc = window.rtc_connections[sender_id];
    pc.setRemoteDescription(new RTCSessionDescription(answer));
}

function receivedIceCandidate(candidate, sender_id) {
    const pc = window.rtc_connections[sender_id];
    pc.addIceCandidate(new RTCIceCandidate(candidate));
}

function sendData(data) {
    for(let id in window.rtc_connections) {
        const pc = window.rtc_connections[id];
        const myChannel = pc.myChannel;
        myChannel.send(JSON.stringify(data));
    }
}

function disconnect_all() {
    sendData({
        id:window.ws.meta.id, 
        name:window.ws.meta.name, 
        isTyping:false, 
        type:"typing"});
    Object.keys(window.rtc_connections).forEach((key) => {
        window.rtc_connections[key].close();
    });
    window.rtc_connections = {};
}

export { createOffer, receivedOffer, receivedAnswer, receivedIceCandidate, sendData, disconnect_all };