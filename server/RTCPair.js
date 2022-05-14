const {prepare_message} = require('./utils');

class Room {
    sockets = []
    constructor(){}
    addSocket(socket){this.sockets.push(socket)}
    removeSocket(socket){
        this.sockets.splice(this.sockets.indexOf(socket), 1);
    }

    sendOffer(sender_data, recipient_id, offer) {
        const recipient = this.sockets.find(s => s.meta.id === recipient_id);
        recipient.send(prepare_message('clientRecieveOffer', {offer, sender_data}));
    }

    sendAnswer(sender_data, recipient_id, answer) {
        const recipient = this.sockets.find(s => s.meta.id === recipient_id);
        recipient.send(prepare_message('clientRecieveAnswer', {answer, sender_data}));
    }

    sendIceCandidate(sender_data, recipient_id, candidate) {
        const recipient = this.sockets.find(s => s.meta.id === recipient_id);
        recipient.send(prepare_message('clientRecieveIceCandidate', {candidate, sender_data}));
    }

    getMembers(){
        return this.sockets.map(s => s.meta); // should contain the id and name
    }
}

class RTCPair {
    offer = null;
    answer = null;
    
    sockets = {
        'caller': null,
        'callee': null
    }

    ice_candidates = {
        'caller': [],
        'callee': []
    }


    addSocket(socket) {
        this.sockets[socket.meta.role] = socket;
    }

    otherSocket(socket) {
        if(socket.meta.role == 'caller') {
            return this.sockets['callee'];
        }
        return this.sockets['caller'];
    }


    empty(){return !!this.sockets.callee}

    setOffer(offer) {this.offer = offer}
    setAnswer(answer) {this.answer = answer}

}

module.exports = {RTCPair, Room}