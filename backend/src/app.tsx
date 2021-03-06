import * as http from 'http'
import * as socket from 'socket.io'

import { Status, Color, PlayerContent, RoomMap, SocketMap, MessageTypes } from "./DataModels/ContentModels";
import { InitialMessage, StatusMessage, Message, SetupMessage, MoveMessage } from "./DataModels/MessageModels"
import { initializePieces } from "./GamePlay/Initializer";
import { processMessage, reconnect } from "./GamePlay/ProcessMessage";

var rooms : RoomMap = {};
var sockets : SocketMap = {};


console.log("run");

const server = http.createServer()
const io = socket(server)
const date = new Date()

const stringyFyRooms = () => {
  console.log("ROOMS:");
  for (var key in rooms) {
    const player1 = rooms[key].player1;
    const player2 = rooms[key].player2;
    const status = rooms[key].status;
    console.log("id:" + key + " player1:{name:" + player1.name + ",wsid:" + player1.ws.id + ", \npieces:" +  JSON.stringify(player1.pieces) + "},\n player2:" + (player2 ? "{name:" + player2.name + ",wsid:" + player2.ws.id + " \npieces:" +  JSON.stringify(player2.pieces) + "}" : "null") + ", status:" + status);
  }
}


io.on('connection', function connection(ws) {
  ws.on(MessageTypes.Join, function incoming(data) {
    data = JSON.parse(data)
    const message = data as Message
    var roomNumber = message.roomNumber

    console.log("roomnumber:" + roomNumber + " id:" + ws.id)
    //if no room number, game is getting started
    if(!roomNumber) {
      roomNumber = uuidv4();
      const color = message.color;
      const player1 : PlayerContent = {
        name: message.name,
        color: color,
        pieces: initializePieces(color),
        ws: ws,
        lastActivityTimeInMs: date.getTime(),
        setupCompleted: false
      }

      rooms[roomNumber] = {
        player1: player1,
        player2: undefined,
        prevStatus: undefined,
        status: Status.NotStarted,
        roomNumber: roomNumber,
        enableAllLogs: message.enableAllLogs
      };
      
      const initialData : InitialMessage = {
        name: player1.name,
        color: player1.color,
        roomNumber: roomNumber,
        initialPositions: player1.pieces,
        status: Status.NotStarted,
        setupCompleted: false,
        opponentName: undefined,
        enableAllLogs: message.enableAllLogs
      }

      ws.emit(MessageTypes.Join, JSON.stringify(initialData));
      sockets[ws.id] = {
        id: ws.id,
        roomNumber: roomNumber
      }

    } else {
      if (rooms[roomNumber]) {
        //connecting to existing room
        if (!rooms[roomNumber].player2) {
          // only 1 player has connected tll now
            if (rooms[roomNumber].player1.name === message.name) {
              //same name, error out
              ws.emit(MessageTypes.Error, JSON.stringify({error: "same name as player1. please change your name."}))              
            } else {
              //asign opposite color 
              const color = rooms[roomNumber].player1.color == Color.Blue ? Color.Red : Color.Blue
              
              //add player 2
              const player2 : PlayerContent = {
                name: message.name,
                color: color,
                pieces: initializePieces(color),
                ws: ws,
                lastActivityTimeInMs: date.getTime(),
                setupCompleted: false
              }

              rooms[roomNumber].player2 = player2 
              rooms[roomNumber].prevStatus = rooms[roomNumber].status
              rooms[roomNumber].status = Status.Setup;
              const player1 = rooms[roomNumber].player1;

              const initialData : InitialMessage = {
                name: player2.name,
                color: player2.color,        
                roomNumber: roomNumber,
                initialPositions: player2.pieces,
                status: Status.Setup,
                setupCompleted: false,
                opponentName: player1.name,
                enableAllLogs: rooms[roomNumber].enableAllLogs
              }
        
              ws.emit(MessageTypes.Join, JSON.stringify(initialData));
              sockets[ws.id] = {
                id: ws.id,
                roomNumber: roomNumber
              }

              const statusMessage : StatusMessage = {
                name: player1.name,
                color: player1.color,
                enableAllLogs: rooms[roomNumber].enableAllLogs,
                roomNumber: roomNumber,
                status: Status.Setup,
                setupCompleted: player1.setupCompleted,
                opponentName: player2.name
              }

              player1.ws.emit(MessageTypes.Status, JSON.stringify(statusMessage))
          }
        } else {
          console.log("checking for reconnect") 
          reconnect(rooms[roomNumber], message, ws, sockets)
        }
      } else {
        //invalid room code, error out
        ws.emit(MessageTypes.Error, JSON.stringify({error: "room doesn't exist. create the room instead."}))
      }
    }
  //stringyFyRooms();  
  });

  ws.on(MessageTypes.Setup, function(data) {
    data = JSON.parse(data)
    const setupMessage = data as SetupMessage
    var roomNumber = setupMessage.roomNumber
    console.log("processing setup message. roomnumber:" + roomNumber + " id:" + ws.id)
    processMessage(rooms[roomNumber], setupMessage, MessageTypes.Setup, ws, sockets)
  })

  ws.on(MessageTypes.Move, function(data) {
    data = JSON.parse(data)
    const moveMessage = data as MoveMessage
    var roomNumber = moveMessage.roomNumber
    console.log("processing move message. roomnumber:" + roomNumber + " id:" + ws.id)
    processMessage(rooms[roomNumber], moveMessage, MessageTypes.Move, ws, sockets)
  })

  ws.on('disconnect', function close(){
    console.log("connection closed by " + ws.id);
    removeWebsocket(ws)
  });
});

server.listen({port: 3030, listeningListener: () => {
  console.log("listening to 3030")
}})

function removeWebsocket(ws: socket.Socket) {
    const socket = sockets[ws.id]
    if (socket) {
    const room = rooms[socket.roomNumber]

    // If only one player has joined, delete the game
    if (room.status === Status.NotStarted) {
      delete rooms[socket.roomNumber]
      return
    }

    var source : PlayerContent
    var destination : PlayerContent
    if (room.player1 && room.player1.ws && room.player1.ws.id === ws.id) {
      source = room.player1
      destination = room.player2
    } else {
      source = room.player2
      destination = room.player1
    }
    
    source.ws = undefined;
    source.lastActivityTimeInMs = date.getTime()
    delete sockets[ws.id]

    // if game is not  paused, update prev status 
    // send Pause status to destination as it exists
    if (room.status !== Status.Paused) {
      room.prevStatus = room.status
      room.status = Status.Paused
      const statusMessage : StatusMessage = {
        name: destination.name,
        color: destination.color,       
        enableAllLogs: room.enableAllLogs,
        roomNumber: socket.roomNumber,
        status: Status.Paused,
        setupCompleted: destination.setupCompleted,
        opponentName: source.name
      }
  
      destination.ws.emit(MessageTypes.Status, JSON.stringify(statusMessage))  
    }
    //stringyFyRooms()
  } else {
    console.log(ws.id + " not present in sockets")
  }
}

function uuidv4() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var charactersLength = characters.length;
  for ( var i = 0; i < 4; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

