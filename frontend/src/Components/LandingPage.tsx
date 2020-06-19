import * as React from 'react'
import { ChatInput } from './JoinGameButton'
import { InitialMessage, StatusMessage, ArrangedPiecesMessage, ErrorMessage, Message,
instanceOfErrorMessage, instanceOfInitialMessage, instanceOfStatusMessage, instanceOfArrangedPiecesMessage } from '../DataModels/MessageModels'
import { PieceMap, Status, Color } from '../DataModels/ContentModels'
import { Board } from './Board'

import * as io from 'socket.io-client'

const URL = process.env.REACT_APP_BACKEND_URL

interface LandingPageState {
  name: string,
  color: Color,
  roomNumber: string,
  receivedRoomNumber: string,
  messages: string[],
  playerPieces: PieceMap,
  ws: SocketIOClient.Socket,
  setupCompleted: boolean,
  status: Status
} 

export class LandingPage extends React.Component<{}, LandingPageState> {
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
      status: Status.NotStarted,
      setupCompleted: false
    }
  }

  ws = io.connect(URL)

  componentDidMount() {
    this.ws.on('connect', () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    });

    this.ws.on('message', evt => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt)
      if (!this.state.receivedRoomNumber) {
        if (instanceOfInitialMessage(message)) {
          const initialContent = message as InitialMessage
          this.setState({
            receivedRoomNumber: initialContent.roomNumber, 
            playerPieces: initialContent.initialPositions, 
            status: initialContent.status, 
            color: initialContent.color,
            setupCompleted: initialContent.setupCompleted
          });

          const subMessage = initialContent.setupCompleted ? "re-joined" : "joined"
          this.addMessage(Color[initialContent.color] + " " + subMessage+ " the game")
        } else if (instanceOfErrorMessage(message)) {
          const errorContent = message as ErrorMessage
          alert(errorContent.error);
        }
      } else {
        if (instanceOfArrangedPiecesMessage(message)) {
          const arrangedPiecesMessage = message as ArrangedPiecesMessage;
          var currentPieces = arrangedPiecesMessage.arrangedPositions
          var playerPieces = this.state.playerPieces
          for (var i = 0; i < 10; i ++) {
            for (var j = 0; j < 10; j++) {
               const key = i + "," + j
               playerPieces[key] = currentPieces[key]
            }
          }

          this.setState({playerPieces: playerPieces, status: arrangedPiecesMessage.status})
          this.addMessage(arrangedPiecesMessage.logMessage)
        } else if (instanceOfStatusMessage(message)) {
          const statusMessage = message as StatusMessage;
          this.setState({status: statusMessage.status, setupCompleted: statusMessage.setupCompleted})

        }
      }
    });


    this.ws.on('disconnect', () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: io.connect(URL)
      })
    })
  }

  addMessage = message =>
    this.setState(state => ({ messages: [message, ...state.messages] }))

  submitGameStartMessage = () => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    const message : Message = {
      name: this.state.name, 
      color: this.state.color, 
      roomNumber: this.state.roomNumber
    }
    this.ws.send(JSON.stringify(message))
    this.addMessage(this.state.color + " joining game ...")
  }

  submitPiecesArrangedMessage = (pieces: PieceMap, logMessage: string) => {
    const message : ArrangedPiecesMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      arrangedPositions: pieces, 
      roomNumber: this.state.receivedRoomNumber,
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
        setupCompleted={this.state.setupCompleted}
        sendMoveMessage={this.submitMoveMessage}
        onClickStartButton={this.submitPiecesArrangedMessage}></Board>
      </div>
    </>
  }
}
