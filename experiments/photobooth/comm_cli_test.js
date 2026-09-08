const WebSocket = require('ws');

// rejectUnauthorized: false bypasses self-signed certificate errors for local testing
var URL = "192.168.1.7";
const ws = new WebSocket('wss://' + URL + ':8080', {
  rejectUnauthorized: false 
});

ws.on('open', () => {
  console.log('Connected to secure server!');
  ws.send('Hello Secure World!');
});

ws.on('message', (data) => {
  console.log(`[Reply]: ${data}`);
});

