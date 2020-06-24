import { ErrorMessage, Message, SetupMessage, 
StatusMessage,
InitialMessage} from "../DataModels/MessageModels"
import { RoomContent, Status, PlayerContent, PieceMap, SocketMap, MessageTypes } from "../DataModels/ContentModels"
import * as socket from 'socket.io'
const date = new Date()

export const processMessage = (room: RoomContent, message: SetupMessage, messageType: string, ws: socket.Socket, sockets: SocketMap) => {
    var source : PlayerContent
    var destination : PlayerContent

    if (room.player1.ws.id === ws.id) {
        source = room.player1
        destination = room.player2
    } else if (room.player2.ws.id === ws.id) {
        source = room.player2
        destination = room.player1
    }

    // update source info
    source.pieces = message.arrangedPositions
    source.lastActivityTimeInMs = date.getTime()
    source.setupCompleted = true

    if (room.status === Status.Setup) {
        destination.pieces = getCombinedPieces(destination, source)
    } else {
        destination.pieces = source.pieces
    }
    
    room.status = message.status === Status.Finished ? Status.Finished : room.status

    if (room.status === Status.Setup) {
        room.status = Status.SetUpMidway
    } else if (room.status === Status.SetUpMidway) {
        room.status = Status.WaitingForRed
    } else if (room.status === Status.WaitingForRed) {
        room.status = Status.WaitingFoBlue
    } else if (room.status === Status.WaitingFoBlue) {
        room.status = Status.WaitingForRed
    }

    message.status = room.status;
    message.arrangedPositions = destination.pieces

    // forward info to destnation
    destination.ws.emit(messageType, JSON.stringify(message))    
    
    // send status to source
    var statusMessage : StatusMessage = {
        roomNumber: message.roomNumber,
        name: source.name,
        color: source.color,
        status: message.status,
        setupCompleted: source.setupCompleted
    }
    source.ws.emit(MessageTypes.Status, JSON.stringify(statusMessage))
}

export const reconnect = (room: RoomContent, message: Message, ws: socket.Socket, sockets: SocketMap) : void => {
        var source : PlayerContent
        var destination : PlayerContent
    
        if (message.name === room.player1.name && !room.player1.ws) {
            source = room.player1
            destination = room.player2
        } else if (message.name === room.player2.name && !room.player2.ws) {
            source = room.player2
            destination = room.player1
        } else {

            //Either new player name is trying to connect, or exisitng player is trying to reconnect
            var errorMessage : ErrorMessage = {
                name: undefined,
                color: undefined,
                roomNumber: undefined,
                error: "2 players have already joined this game."
            }
            ws.emit(MessageTypes.Error, JSON.stringify(errorMessage))
            return
        }    

        console.log(source.name + " reconnecting. resending startup data.")
        source.ws = ws
        // Add new socket to establish reconnect
        sockets[ws.id] = {
            id: ws.id,
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
            destination.ws.emit(MessageTypes.Status, JSON.stringify(statusMessage))
        }

        // initial data will be combined pieces
        var combinedPieces : PieceMap = {}
        if (room.status === Status.Setup || room.status === Status.SetUpMidway) {
            combinedPieces = getCombinedPieces(source, destination)
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
        source.ws.emit(MessageTypes.Join, JSON.stringify(initialData))         
}

export const stringyFyRoom = (room: RoomContent) => {
    console.log("ROOM:");
      const player1 = room.player1;
      const player2 = room.player2;
      const status = room.status;
      console.log("player1:{name:" + player1.name + ",wsid:" + player1.ws.id + ", \npieces:" +  JSON.stringify(player1.pieces) + "},\n player2:" + (player2 ? "{name:" + player2.name + ",wsid:" + player2.ws.id + " \npieces:" +  JSON.stringify(player2.pieces) + "}" : "null") + ", status:" + status);
  }
  
const getCombinedPieces = (source: PlayerContent, destination: PlayerContent) : PieceMap => {
    var combinedPieces : PieceMap = {}
    for (var i = 0; i< 10; i ++) {
        for (var j = 0; j < 10; j ++) {
            const key = i + "," + j
            combinedPieces[key] = source.pieces[key]
            if (destination.setupCompleted && !combinedPieces[key]) {
                combinedPieces[key] = destination.pieces[key]
            }
        }
    }
    return combinedPieces
}
