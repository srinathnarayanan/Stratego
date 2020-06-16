import * as React from 'react'
import { ChatInput } from './ChatInput'
import { InitialMessage, StatusMessage, ArrangedPiecesMessage, ErrorMessage, Message,
instanceOfErrorMessage, instanceOfInitialMessage, instanceOfStatusMessage, instanceOfArrangedPiecesMessage } from '../DataModels/MessageModels'
import { PieceMap, Status, Color } from '../DataModels/ContentModels'
import { Board } from './Board'

//import ChatMessage from './ChatMessage'

const URL = 'ws://localhost:3030/'

interface ChatState {
  name: string,
  color: Color,
  roomNumber: string,
  receivedRoomNumber: string,
  messages: string[],
  playerPieces: PieceMap,
  ws: WebSocket,
  wsId: string,
  status: Status
} 

class Chat extends React.Component<{}, ChatState> {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Player 1',
      color: Color.Red,
      roomNumber: undefined,
      receivedRoomNumber: undefined,
      messages: [],
      playerPieces: {},
      ws: undefined,
      wsId: undefined,
      status: Status.NotStarted
    }
  }

  ws = new WebSocket(URL)

  componentDidMount() {
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    }

    this.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data)
      if (!this.state.receivedRoomNumber) {
        if (instanceOfInitialMessage(message)) {
          const initialContent = message as InitialMessage
          this.setState({
            receivedRoomNumber: initialContent.roomNumber, 
            playerPieces: initialContent.initialPositions, 
            status: initialContent.status, 
            color: initialContent.color, 
            wsId: initialContent.wsId
          });
          this.addMessage("Other player has joined the game")
        } else if (instanceOfErrorMessage(message)) {
          const errorContent = message as ErrorMessage
          alert(errorContent.error);
        }
      } else {
        if (instanceOfArrangedPiecesMessage(message)) {
          const arrangedPiecesMessage = message as ArrangedPiecesMessage;
          var opponentPieces = arrangedPiecesMessage.arrangedPositions
          var playerPieces = this.state.playerPieces
          for (var i = 0; i < 10; i ++) {
            for (var j = 0; j < 10; j++) {
               const key = i + "," + j

               if ((this.state.status < Status.WaitingForRed && !playerPieces[key]) || (this.state.status >= Status.WaitingForRed)) {
                  playerPieces[key] = opponentPieces[key]
               } 
            }
          }
          this.setState({playerPieces: playerPieces, status: arrangedPiecesMessage.status})
          this.addMessage(arrangedPiecesMessage.logMessage)
        } else if (instanceOfStatusMessage(message)) {
          const statusMessage = message as StatusMessage;
          this.setState({status: statusMessage.status})

        }
      }
    }


    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: new WebSocket(URL),
      })
    }
  }

  addMessage = message =>
    this.setState(state => ({ messages: [message, ...state.messages] }))

  submitGameStartMessage = () => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    const message : Message = { name: this.state.name, color: this.state.color, roomNumber: this.state.roomNumber, wsId: this.state.wsId }
    this.ws.send(JSON.stringify(message))
    this.addMessage("joining game ...")
  }

  submitPiecesArrangedMessage = (pieces: PieceMap, logMessage: string) => {
    const message : ArrangedPiecesMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      arrangedPositions: pieces, 
      roomNumber: this.state.receivedRoomNumber, 
      wsId: this.state.wsId,
      status: this.state.status,
      logMessage: logMessage 
    }
    this.ws.send(JSON.stringify(message))
    this.addMessage(logMessage)
  }

  submitMoveMessage = (pieces: PieceMap, logMessage: string, isFlagTaken: boolean) => {
    const message : ArrangedPiecesMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      arrangedPositions: pieces, 
      roomNumber: this.state.receivedRoomNumber, 
      wsId: this.state.wsId,
      status: isFlagTaken ? Status.Finished : this.state.status,
      logMessage: logMessage
    }
    this.ws.send(JSON.stringify(message))
    this.addMessage(logMessage)    
  }

  render() {
    return !this.state.receivedRoomNumber ? (
      <div>
          Name:&nbsp;
          <input
            type="text"
            id={'name'}
            placeholder={'Enter your name...'}
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
          />
          <br/>
          <div>
        <ChatInput
          name="start a game"
          onSubmitMessage={() => this.submitGameStartMessage()}
        />
        Room code:&nbsp;
          <input
            type="text"
            id={'roomcode'}
            placeholder={'Enter roomcode to join...'}
            value={this.state.roomNumber}
            onChange={e => this.setState({ roomNumber: e.target.value })}
          />
          <br/>
          <ChatInput
          name="join existing game"
          onSubmitMessage={() => this.submitGameStartMessage()}
         />

        </div>
      </div>
    ) :  
    <>
    <div className="Message">
      {this.state.messages.map((value : string) => {
        return <><p> {value} </p><br/></>
      })}
      </div>
      <div>
        <div className="Metadata">
        roomNumber: <h4>{this.state.receivedRoomNumber}</h4><br/>
        status: <h4>{Status[this.state.status]}</h4>
        </div>
        <Board 
        playerColor={this.state.color} 
        playerPieces={this.state.playerPieces} 
        status={this.state.status} 
        sendMoveMessage={this.submitMoveMessage}
        onClickStartButton={this.submitPiecesArrangedMessage}></Board>
      </div>
    </>
  }
}

export default Chat
