import { ErrorMessage, Message, ArrangedPiecesMessage, instanceOfArrangedPiecesMessage } from "../DataModels/MessageModels"
import { RoomContent, PlayerContent } from "../DataModels/ContentModels"

export const processMessage = (room: RoomContent, message: Message, ws: WebSocket) => {
    var sourcePlayer : PlayerContent
    var destinationPlayer : PlayerContent

    const player1 = room.player1
    const player2 = room.player2

    if (player1.customWs.id === message.wsId) {
        sourcePlayer = player1
        destinationPlayer = player2
    } else if (player2.customWs.id === message.wsId) {
        sourcePlayer = player2
        destinationPlayer = player1
    } else {

        //2 players already joined, error out
        var errorMessage : ErrorMessage = {
            name: undefined,
            color: undefined,
            roomNumber: undefined,
            wsId: undefined,
            error: "2 players have already joined this game."
        }
        ws.send(JSON.stringify(errorMessage))
        return
    }

    if (instanceOfArrangedPiecesMessage(message)) {
        destinationPlayer.customWs.ws.send(JSON.stringify(message))
    }
}