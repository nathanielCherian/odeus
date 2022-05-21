const http = require('http');

const SocketEvents = require('./SocketEvents');
const { RTCPair, Room } = require('./RTCPair');
const WebSocket = require('ws');

const {uuidv4, prepare_message, parse_message} = require('./utils');



const main_room = new Room();

const socket_events = new SocketEvents();

// setting ping event
socket_events.on('ping', (payload, socket) => {
  console.log("recieved ping from ", socket.meta.id);
  socket.send(prepare_message('pong', socket.meta));
});

socket_events.on('client:request-join-room', (payload, socket) => {
  const {id, name} = payload;
  socket.meta.name = name;
  main_room.addSocket(socket); // adding new guy to the room
  console.log("adding socket to room ", id);
  let status = 'ok';
  socket.send(prepare_message('server:join-room-status', {id: id, status})); // confirmation of joining room
  if(status !== 'ok') return;
});

socket_events.on('client:request-member-list', (payload, socket) => {
    const members = main_room.getOtherMembers(socket);
    socket.send(prepare_message('server:member-list', {members}));
});

socket_events.on('client:send-offer', (payload, socket) => {
  const {offer, partner_id} = payload;
  console.log("recieved offer from ", socket.meta['id']);
  main_room.sendOffer(socket.meta, partner_id, offer);
});

socket_events.on('client:send-answer', (payload, socket) => {
  const {answer, partner_id} = payload;
  console.log("recieved answer from ", socket.meta['id']);
  main_room.sendAnswer(socket.meta, partner_id, answer);
});

socket_events.on('client:send-ice-candidate', (payload, socket) => {
  const {candidate, partner_id} = payload;
  console.log("recieved ice candidate from ", socket.meta['id']);
  main_room.sendIceCandidate(socket.meta, partner_id, candidate);
});

socket_events.on("client:leave-room", (payload, socket) => {
  console.log("leaving room: ", socket.meta.id);
  main_room.removeSocket(socket);
});

const server_port = 8000;
const ws_port = 7010

const wss = new WebSocket.Server({ port: ws_port });
wss.on('connection', (ws) => {
  console.log('new connection: ');
  const meta = {
    id: uuidv4(),
  }
  ws.meta = meta;
  
  ws.on('message', (message) => {
    const parsed_message = parse_message(message);
    if(!parsed_message) return; // 
    const {code, payload} = parsed_message
    console.log({flow:"incoming",code, payload})
    socket_events.message_received({code, payload}, ws);
  });

  ws.on('close', () => {
    console.log('connection closed ', ws.meta.id);
    main_room.removeSocket(ws);
  });
  
});

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(main_room.toString());
});

server.listen(server_port, () => console.log(`Server running at http://localhost:${server_port}\nWebsocket running on :${ws_port}`));