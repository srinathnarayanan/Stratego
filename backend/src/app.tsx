import { Server } from "ws"
import { RoomContent, Status, Color, PlayerContent } from "./DataModels/RoomContent";
import { InitialContent } from "./DataModels/InitialContent"
import { initializePieces } from "./GamePlay/Initializer";

type RoomMap = Record<string, RoomContent>;
var rooms : RoomMap = {};


console.log("run");

const wss = new Server({ port: 3030});

const stringyFyRooms = () => {
  console.log("ROOMS:");
  for (var key in rooms) {
    const player1 = rooms[key].player1;
    const player2 = rooms[key].player2;
    const status = rooms[key].status;
    console.log("id:" + key + " player1:{name:" + player1.name + ",wsid:" + player1.customWs.id + ", \npieces:" +  JSON.stringify(player1.pieces) + "},\n player2:" + (player2 ? "{name:" + player2.name + ",wsid:" + player2.customWs.id + " \npieces:" +  JSON.stringify(player2.pieces) + "}" : "null") + ", status:" + status);
  }
}



wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    data = JSON.parse(data)
    var roomNumber = data.roomNumber

    //if no room number, game is getting started
    if(!roomNumber) {
      const wsId = uuidv4();
      roomNumber = uuidv4();
      const color = data.color === "red" ? Color.Red : Color.Blue;
      const player1 : PlayerContent = {
        name: data.name,
        color: color,
        pieces: initializePieces(color),
        customWs: { ws: ws, id: wsId}
      }

      rooms[roomNumber] = {
        player1: player1,
        player2: null,
        status: Status.NotStarted
      };
      
      const initialData : InitialContent = {
        roomNumber: roomNumber,
        initialPositions: player1.pieces
      }

      ws.send(JSON.stringify(initialData));

    } else {
      if (rooms[roomNumber]) {
        //connecting to existing room
        if (rooms[roomNumber].player2 == null) {
          // only 1 player has connected tll now
            if (rooms[roomNumber].player1.name === data.name) {
              //same name, error out
              ws.send(JSON.stringify({error: "same name as player1. please change your name."}))              
            } else {
              //asign opposite color 
              const color = rooms[roomNumber].player1.color == Color.Blue ? Color.Red : Color.Blue
              const wsId = uuidv4();
              
              //add player 2
              const player2 : PlayerContent = {
                name: data.name,
                color: color,
                pieces: initializePieces(color),
                customWs: { ws: ws, id: wsId}
              }

              rooms[roomNumber].player2 = player2 
              rooms[roomNumber].status = Status.Started;
  
              const initialData : InitialContent = {
                roomNumber: roomNumber,
                initialPositions: player2.pieces
              }
        
              ws.send(JSON.stringify(initialData));
          }
        } else {
          //2 players already joied, error out
          ws.send(JSON.stringify({error: "2 players have already joined this game."}))
        }
      } else {
        //invalid room code, error out
        ws.send(JSON.stringify({error: "room doesn't exist. create the room instead."}))
      }
    }
  stringyFyRooms();  
  });

  ws.on('close', function close(){
    console.log("connection closed");
    removeWebsocket(ws)
  });
});

function removeWebsocket(ws: WebSocket) {
  for (var key in rooms) {
    const player1 = rooms[key].player1;
    const player2 = rooms[key].player2;
    if ((player1 && player1.customWs.ws === ws) || (player2 && player2.customWs.ws === ws)) {
      console.log("ending game " + key);
      delete rooms[key];
      break;
    }
  }
  stringyFyRooms()
}

/*
wss2.on('connection', function connection(ws) {
  console.log("hello size:" + wss2.clients.size)
  ws.on('message', function incoming(data) {
    wss2.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
*/

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

