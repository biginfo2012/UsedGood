import io from 'socket.io-client';

let socket = undefined;
const localIP = 'localhost';
const networkIP = '8.140.160.60';
const port = 9090;
const networkConnection = false;

function initialiseSocket() {
  const url = networkConnection ?
    `http://${networkIP}:${port}` :
    `http://${localIP}:${port}`;
  
  socket = io(url);
}

export function addEventListener(event) {
  if (!socket) {
    initialiseSocket();
  }

  socket.on(event.type, event.callback);
}

export function sendEvent(event) {
  if(!socket)
    initialiseSocket();
  socket.emit(event.type, event.data);
}
