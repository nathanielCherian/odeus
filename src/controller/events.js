
function join_room(name, after_join_room) {
    if(window.ws.readyState !== WebSocket.OPEN) {
        console.log('not connected');
        return;
    }
    console.log("user wants to join room.")
    after_join_room();
}

export {join_room};