module.exports =  class SocketEvents {
    constructor(){
      this.events = new Map();
    }
  
    on(code, callback){this.events.set(code, callback);}
    message_received({code, payload}, socket){
      const callback = this.events.get(code);
      if(callback) callback(payload, socket);
    }
}