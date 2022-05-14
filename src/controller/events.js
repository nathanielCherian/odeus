
function join_room(name) {
    if(window.ws.readyState !== WebSocket.OPEN) {
        console.log('not connected to server');
        return;
    }

    if (window.ws.meta.id === null) {
        console.log("did not establish handshake with server.");
        return;
    }

    window.ws.meta.name = name;
    window.ws.emit('client:request-join-room', {id:window.ws.meta.id, name});
}

function request_member_list() {
    window.ws.emit('client:request-member-list', {});
}

export {join_room, request_member_list};