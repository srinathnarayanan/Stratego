import * as http from 'http'
import * as socket from 'socket.io'

import { RoomContent, Status, Color, PlayerContent } from "./DataModels/ContentModels";
import { InitialMessage, StatusMessage, Message } from "./DataModels/MessageModels"
import { initializePieces } from "./GamePlay/Initializer";
import { processMessage } from "./GamePlay/ProcessMessage";

type RoomMap = Record<string, RoomContent>;
var rooms : RoomMap = {};


console.log("run");

const server = http.createServer()
const io = socket(server)

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
  ws.on('message', function incoming(data) {
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
        ws: ws
      }

      rooms[roomNumber] = {
        player1: player1,
        player2: undefined,
        status: Status.NotStarted
      };
      
      const initialData : InitialMessage = {
        name: player1.name,
        color: player1.color,
        roomNumber: roomNumber,
        initialPositions: player1.pieces,
        status: Status.NotStarted
      }

      ws.send(JSON.stringify(initialData));

    } else {
      if (rooms[roomNumber]) {
        //connecting to existing room
        if (!rooms[roomNumber].player2) {
          // only 1 player has connected tll now
            if (rooms[roomNumber].player1.name === message.name) {
              //same name, error out
              ws.send(JSON.stringify({error: "same name as player1. please change your name."}))              
            } else {
              //asign opposite color 
              const color = rooms[roomNumber].player1.color == Color.Blue ? Color.Red : Color.Blue
              
              //add player 2
              const player2 : PlayerContent = {
                name: message.name,
                color: color,
                pieces: initializePieces(color),
                ws: ws
              }

              rooms[roomNumber].player2 = player2 
              rooms[roomNumber].status = Status.Setup;
  
              const initialData : InitialMessage = {
                name: player2.name,
                color: player2.color,        
                roomNumber: roomNumber,
                initialPositions: player2.pieces,
                status: Status.Setup
              }
        
              ws.send(JSON.stringify(initialData));

              const player1 = rooms[roomNumber].player1;
              const statusMessage : StatusMessage = {
                name: player1.name,
                color: player1.color,        
                roomNumber: roomNumber,
                status: Status.Setup
              }

              player1.ws.send(JSON.stringify(statusMessage))
          }
        } else {
          console.log("going to process")
            processMessage(rooms[roomNumber], message, ws)
        }
      } else {
        //invalid room code, error out
        ws.send(JSON.stringify({error: "room doesn't exist. create the room instead."}))
      }
    }
  //stringyFyRooms();  
  });

  ws.on('disconnect', function close(){
    console.log("connection closed by " + ws.id);
    removeWebsocket(ws)
  });
});

server.listen({port: 3030, listeningListener: () => {
  console.log("listening to 3030")
}})

function removeWebsocket(ws: socket.Socket) {
  for (var key in rooms) {
    const player1 = rooms[key].player1;
    const player2 = rooms[key].player2;
    if ((player1 && player1.ws.id === ws.id) || (player2 && player2.ws.id === ws.id)) {
      console.log("ending game " + key);
      delete rooms[key];
      break;
    }
  }
  //stringyFyRooms()
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

