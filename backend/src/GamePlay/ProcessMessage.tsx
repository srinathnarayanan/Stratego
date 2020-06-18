import { ErrorMessage, Message, ArrangedPiecesMessage, 
instanceOfArrangedPiecesMessage } from "../DataModels/MessageModels"
import { RoomContent, Status } from "../DataModels/ContentModels"
import * as socket from 'socket.io'

//export const processMessage = (room: RoomContent, message: Message, ws: WebSocket) => {
export const processMessage = (room: RoomContent, message: Message, ws: socket.Socket) => {

    const player1 = room.player1
    const player2 = room.player2

    var player1IsSource : boolean

    /*
    if (player1.customWs.id === message.wsId) {
        player1IsSource = true
    } else if (player2.customWs.id === message.wsId) {
        player1IsSource = false
    } else {
*/
        if (player1.ws.id === ws.id) {
            player1IsSource = true
        } else if (player2.ws.id === ws.id) {
            player1IsSource = false
        } else {
    
        //2 players already joined, error out
        var errorMessage : ErrorMessage = {
            name: undefined,
            color: undefined,
            roomNumber: undefined,
            error: "2 players have already joined this game."
        }
        ws.send(JSON.stringify(errorMessage))
        return
    }

    if (instanceOfArrangedPiecesMessage(message)) {
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
        
        var statusMessage = {
            roomNumber: arrangedPiecesMessage.roomNumber,
            name: undefined,
            color: undefined,
            wsId: undefined,
            status: arrangedPiecesMessage.status 
        }

        if (arrangedPiecesMessage.status === Status.Finished) {
            console.log("Game over!")
        }
        if (player1IsSource) {
            player2.ws.send(JSON.stringify(arrangedPiecesMessage))
            player1.pieces = arrangedPiecesMessage.arrangedPositions
            player1.ws.send(JSON.stringify(statusMessage))
        } else {
            player1.ws.send(JSON.stringify(arrangedPiecesMessage))
            player2.pieces = arrangedPiecesMessage.arrangedPositions
            player2.ws.send(JSON.stringify(statusMessage))
        }
            
    }    
}

