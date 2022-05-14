const http = require('http');

const SocketEvents = require('./SocketEvents');
const { RTCPair, Room } = require('./RTCPair');
const WebSocket = require('ws');

const {uuidv4, prepare_message} = require('./utils');

const server = http.createServer((req, res) => {
//   req.addListener('end', () => file.serve(req, res)).resume();
});



const main_room = new Room();

const socket_events = new SocketEvents();

// setting ping event
socket_events.on('ping', (payload, socket) => {
  console.log("recieved ping from ", socket.meta.id);
  socket.send(prepare_message('pong', socket.meta));
});

socket_events.on('joinRoomRequest', (payload, socket) => {
  const {id, name} = payload;
  socket.meta.name = name;
  console.log("adding socket to room ", id);
  const members = main_room.getMembers(); // keeping copy of the members without the new guy
  main_room.addSocket(socket); // adding new guy to the room
  let status = 'ok';
  socket.send(prepare_message('joinRoomRequest-status', {id: id, status})); // confirmation of joining room
  if(status !== 'ok') return;
  // sending the members back to requester to create offers with them 
  socket.send(prepare_message('createOffersCommand', {members})); 
});

socket_events.on('clientInitiateOffer', (payload, socket) => {
  const {offer, partner_id} = payload;
  console.log("recieved offer from ", socket.meta['id']);
  main_room.sendOffer(socket.meta, partner_id, offer);
});

socket_events.on('clientInitiateAnswer', (payload, socket) => {
  const {answer, partner_id} = payload;
  console.log("recieved answer from ", socket.meta['id']);
  main_room.sendAnswer(socket.meta, partner_id, answer);
});

socket_events.on('clientInitiateIceCandidate', (payload, socket) => {
  const {candidate, partner_id} = payload;
  console.log("recieved ice candidate from ", socket.meta['id']);
  main_room.sendIceCandidate(socket.meta, partner_id, candidate);
});




const wss = new WebSocket.Server({ port: 7071 });
wss.on('connection', (ws) => {
  console.log('new connection: ');
  const meta = {
    id: uuidv4(),
  }
  ws.meta = meta;
  
  ws.on('message', (message) => { 
    const {code, payload} = JSON.parse(message);
    console.log({flow:"incoming",code, payload})
    socket_events.message_received({code, payload}, ws);
  });

  ws.on('close', () => {
    console.log('connection closed ', ws.meta.id);
    main_room.removeSocket(ws);
  });
  
});


const port = 8080;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));