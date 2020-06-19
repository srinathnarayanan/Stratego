import { ErrorMessage, Message, ArrangedPiecesMessage, 
instanceOfArrangedPiecesMessage, 
StatusMessage,
InitialMessage} from "../DataModels/MessageModels"
import { RoomContent, Status, PlayerContent, PieceMap, SocketMap } from "../DataModels/ContentModels"
import * as socket from 'socket.io'
const date = new Date()

export const processMessage = (room: RoomContent, message: Message, ws: socket.Socket, sockets: SocketMap) => {
    var source : PlayerContent
    var destination : PlayerContent

    if (reconnect(room, message, ws, sockets)) {
        return;
    }

    if (room.player1.ws.id === ws.id) {
        source = room.player1
        destination = room.player2
    } else if (room.player2.ws.id === ws.id) {
        source = room.player2
        destination = room.player1
    }

    // If we reach here, it is already a ArrangePiecesMessage
    var arrangedPiecesMessage = message as ArrangedPiecesMessage
    room.status = arrangedPiecesMessage.status === Status.Finished ? Status.Finished : room.status

    if (room.status === Status.Setup) {
        room.status = Status.SetUpMidway
    } else if (room.status === Status.SetUpMidway) {
        room.status = Status.WaitingForRed
    } else if (room.status === Status.WaitingForRed) {
        room.status = Status.WaitingFoBlue
    } else if (room.status === Status.WaitingFoBlue) {
        room.status = Status.WaitingForRed
    }

    arrangedPiecesMessage.status = room.status;
        

    if (arrangedPiecesMessage.status === Status.Finished) {
        console.log("Game over!")
    }
    
    // forward info to destnation
    destination.ws.send(JSON.stringify(arrangedPiecesMessage))
    
    // updte source info
    source.pieces = arrangedPiecesMessage.arrangedPositions
    destination.pieces = arrangedPiecesMessage.arrangedPositions
    source.lastActivityTimeInMs = date.getTime()
    source.setupCompleted = true
    
    //send source status
    var statusMessage : StatusMessage = {
        roomNumber: arrangedPiecesMessage.roomNumber,
        name: source.name,
        color: source.color,
        status: arrangedPiecesMessage.status,
        setupCompleted: source.setupCompleted
    }
    source.ws.send(JSON.stringify(statusMessage))
}

const reconnect = (room: RoomContent, message: Message, ws: socket.Socket, sockets: SocketMap) : boolean => {
    if (instanceOfArrangedPiecesMessage(message)) {
        return false
    }

        var source : PlayerContent
        var destination : PlayerContent
    
        if (message.name === room.player1.name && !room.player1.ws) {
            source = room.player1
            destination = room.player2
        } else if (message.name === room.player2.name && !room.player2.ws) {
            source = room.player2
            destination = room.player1
        } else {
            console.log(message.name + "," + room.player1.name + "," + (room.player1.ws ? room.player1.ws.id : "null"))
            console.log(message.name + "," + room.player2.name + "," + (room.player2.ws ? room.player2.ws.id : "null"))

            //Either new player name is trying to connect, or exisitng player is trying to reconnect
            var errorMessage : ErrorMessage = {
                name: undefined,
                color: undefined,
                roomNumber: undefined,
                error: "2 players have already joined this game."
            }
            ws.send(JSON.stringify(errorMessage))
            return true
        }    

        console.log(source.name + " reconnecting. resending startup data.")
        source.ws = ws
        // Add new socket to establish reconnect
        sockets[ws.id] = {
            id: ws.id,
            playerName: source.name,
            roomNumber: room.roomNumber
        }


        // if destination ws is present, change status from paused to previous status
        // send status to dest
        if (destination.ws) {
            room.status = room.prevStatus
            room.prevStatus = Status.Paused
            const statusMessage : StatusMessage = {
                name: destination.name,
                color: destination.color,
                roomNumber: room.roomNumber,
                status: room.status,
                setupCompleted: destination.setupCompleted
            }
            destination.ws.send(JSON.stringify(statusMessage))
        }

        // initial data will be combined pieces
        var combinedPieces : PieceMap = {}
        if (room.status === Status.Setup || room.status === Status.SetUpMidway) {
            for (var i = 0; i< 10; i ++) {
                for (var j = 0; j < 10; j ++) {
                    const key = i + "," + j
                    combinedPieces[key] = source.pieces[key]
                    if (destination.setupCompleted && !combinedPieces[key]) {
                        combinedPieces[key] = destination.pieces[key]
                    }
                }
            }
        } else {
            combinedPieces = source.pieces
        }

        const initialData : InitialMessage = {
            name: source.name,
            color: source.color,
            roomNumber: room.roomNumber,
            initialPositions: combinedPieces,
            status: room.status,
            setupCompleted: source.setupCompleted
        }
        source.lastActivityTimeInMs = date.getTime()
        source.ws.send(JSON.stringify(initialData))         

        return true
}

export const stringyFyRoom = (room: RoomContent) => {
    console.log("ROOM:");
      const player1 = room.player1;
      const player2 = room.player2;
      const status = room.status;
      console.log("player1:{name:" + player1.name + ",wsid:" + player1.ws.id + ", \npieces:" +  JSON.stringify(player1.pieces) + "},\n player2:" + (player2 ? "{name:" + player2.name + ",wsid:" + player2.ws.id + " \npieces:" +  JSON.stringify(player2.pieces) + "}" : "null") + ", status:" + status);
  }
  