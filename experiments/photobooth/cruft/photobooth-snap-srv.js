//import { Server } from "socket.io";

var http = require("http");
var server = http.createServer();

var { Server } = require("socket.io");

//const io = new Server(3000);
const io = new Server({"cors": {"origin":"http://localhost:3000", "methods":["GET", "POST"]}});

io.on("connection", (socket) => {

  console.log("connect...");

  socket.emit("hello", "friend");
  socket.on("howdy", (arg) => {
    console.log(arg);
  });
});

server.listen(3000);
