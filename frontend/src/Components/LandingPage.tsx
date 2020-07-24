import * as React from 'react'
import SideBar from "react-sidebar"
import { ChatInput } from './JoinGameButton'
import { InitialMessage, StatusMessage, SetupMessage, ErrorMessage, Message, MoveMessage} from '../DataModels/MessageModels'
import { PieceMap, Status, Color, MessageTypes, MoveMessageParams, PieceContent } from '../DataModels/ContentModels'
import { Board } from './Board'

import * as io from 'socket.io-client'
import { Gallery } from './Gallery'

const URL = process.env.REACT_APP_BACKEND_URL
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

interface LandingPageState {
  name: string,
  color: Color,
  roomNumber: string,
  receivedRoomNumber: string,
  messages: string[],
  playerPieces: PieceMap,
  ws: SocketIOClient.Socket,
  setupCompleted: boolean,
  status: Status,
  sidebarOpen: boolean,
  removedPieces: PieceContent[],
  opponentMoveFrom: string,
  opponentMoveTo: string,
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
      setupCompleted: false,
      sidebarOpen: false,
      removedPieces: [],
      opponentMoveFrom: undefined,
      opponentMoveTo: undefined,    
    }
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  ws = io.connect(URL)

  componentDidMount() {
    this.ws.on('connect', () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    });

    this.ws.on(MessageTypes.Join, (data) => {
      const message = JSON.parse(data)
      const initialContent = message as InitialMessage
      this.setState({
        receivedRoomNumber: initialContent.roomNumber, 
        playerPieces: initialContent.initialPositions, 
        status: initialContent.status, 
        color: initialContent.color,
        setupCompleted: initialContent.setupCompleted
      });

      const subMessage = initialContent.setupCompleted ? "re-joined" : "joined"
      this.addMessage("Opponent " + subMessage+ " the game")
    })

    this.ws.on(MessageTypes.Error, (data) => {
      const message = JSON.parse(data)
      const errorContent = message as ErrorMessage
      alert(errorContent.error);
    })

    this.ws.on(MessageTypes.Setup, (data) => {
      const message = JSON.parse(data)
      const arrangedPiecesMessage = message as SetupMessage;
      var currentPieces = arrangedPiecesMessage.arrangedPositions
      var playerPieces = this.state.playerPieces
      for (var i = 0; i < 10; i ++) {
        for (var j = 0; j < 10; j++) {
           const key = i + "," + j
           if (!playerPieces[key]) {
             playerPieces[key] = currentPieces[key]
           }
        }
      }

      this.setState({playerPieces: playerPieces, status: arrangedPiecesMessage.status})
      this.addMessage(arrangedPiecesMessage.logMessage)
    })

    this.ws.on(MessageTypes.Move, async (data) => {
      const message = JSON.parse(data)
      const moveMessage = message as MoveMessage;
      var currentPieces = moveMessage.arrangedPositions
      var playerPieces = this.state.playerPieces
      var removedPieces = this.state.removedPieces

      for (var i = 0; i < moveMessage.loserKey.length; i++) {
        if (playerPieces[moveMessage.loserKey[i]]) {
          this.addRemovedPieceToGallery(playerPieces[moveMessage.loserKey[i]])
        }
      }

      const moveKeys = this.processMove(playerPieces, moveMessage.winnerKey, moveMessage.loserKey)
      this.setState({playerPieces: playerPieces, opponentMoveFrom: moveKeys[0], opponentMoveTo: moveKeys[1]})
      this.forceUpdate()
      await sleep(2000)

      for (var i = 0; i < 10; i ++) {
        for (var j = 0; j < 10; j++) {
           const key = i + "," + j
           playerPieces[key] = currentPieces[key]
        }
      }

      this.setState({playerPieces: playerPieces, status: moveMessage.status, removedPieces: removedPieces,
      opponentMoveTo:undefined, opponentMoveFrom: undefined})
      await sleep(2000)
      this.resetInPlay(playerPieces, moveMessage.winnerKey, moveMessage.loserKey)
      this.setState({playerPieces: playerPieces})
      this.forceUpdate()
      
      this.addMessage(moveMessage.logMessage)
    })

    this.ws.on(MessageTypes.Status, (data) => {
      const message = JSON.parse(data)
      const statusMessage = message as StatusMessage;
      this.setState({status: statusMessage.status, setupCompleted: statusMessage.setupCompleted})
    })    

    this.ws.on('disconnect', () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: io.connect(URL)
      })
    })
  }

  processMove = (playerPieces: PieceMap, winnerKey: string, loserKey: string[]) : string[] => {
    if (loserKey.length == 2) {
      playerPieces[loserKey[0]].inPlay = true
      playerPieces[loserKey[1]].inPlay = true
      return loserKey
    } 
    if (playerPieces[loserKey[0]] && playerPieces[winnerKey]) {
      playerPieces[loserKey[0]].inPlay = true
      playerPieces[winnerKey].inPlay = true
    }
    return [loserKey[0], winnerKey]
  }

  resetInPlay = (playerPieces: PieceMap, winnerKey: string, loserKey: string[]) : void => {
    if (loserKey.length == 1) {
      playerPieces[loserKey[0]].inPlay = false
    }
  }
  
  addMessage = message =>
    this.setState(state => ({ messages: [message, ...state.messages] }))

  submitJoinGameMessage = () => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    const message : Message = {
      name: this.state.name, 
      color: this.state.color, 
      roomNumber: this.state.roomNumber
    }
    this.ws.emit(MessageTypes.Join, JSON.stringify(message))
    this.addMessage("You joined the game")
  }

  sendSetupMessage = (pieces: PieceMap, logMessage: string) => {
    const message : SetupMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      arrangedPositions: pieces, 
      roomNumber: this.state.receivedRoomNumber,
      status: this.state.status,
      logMessage: logMessage 
    }
    this.ws.emit(MessageTypes.Setup, JSON.stringify(message))
    this.addMessage(logMessage)
  }

  sendMoveMessage = (moveMessageParams: MoveMessageParams) => {
    const message : MoveMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      arrangedPositions: moveMessageParams.pieces, 
      roomNumber: this.state.receivedRoomNumber,
      status: moveMessageParams.isFlagTaken ? Status.Finished : this.state.status,
      logMessage: moveMessageParams.logMessage,
      winnerKey: moveMessageParams.winnerKey,
      loserKey: moveMessageParams.loserKey
    }
    this.ws.emit(MessageTypes.Move, JSON.stringify(message))
    this.addMessage(moveMessageParams.logMessage)    
  }

  addRemovedPieceToGallery = (removedPiece: PieceContent) => {
    var removedPieces = this.state.removedPieces
    const targetRank = removedPiece.rank
    var i = 0;
    for (; i < removedPieces.length; i ++) {
      if (removedPieces[i].rank > targetRank) {
        break
      }
    }
    removedPieces.splice(i, 0, removedPiece)
    this.setState({removedPieces: removedPieces})
  }

  render() {
    return (
        <SideBar
        sidebar={
          <>
          <div className="Message">
            <h2> LOGS </h2>
              {this.state.messages.map((value : string) => {
              return <><p> {value} </p><br/></>
              })}
          </div>
          <div className="Gallery">
            <h2> Gallery </h2>
            <Gallery removedPieces={this.state.removedPieces}/>
            </div>
          </>
        }
        open={this.state.sidebarOpen}
        onSetOpen={this.onSetSidebarOpen}
        styles={{sidebar: { background: "white" } }}
        >

        <div className="App-Header">
          <h1 className="App-title">Welcome to Stratego</h1>
          {this.state.receivedRoomNumber ? 
            <div className="Metadata">
                <h4>roomNumber: <br/>{this.state.receivedRoomNumber}</h4>
                <h4>status: <br/>{Status[this.state.status]}</h4>
            </div> : <></>}
        </div>


        {!this.state.receivedRoomNumber ? 
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
          onSubmitMessage={() => this.submitJoinGameMessage()}
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
          onSubmitMessage={() => this.submitJoinGameMessage()}
         />

        </div>
      </div>
      :  
      <>
        <button onClick={() => this.onSetSidebarOpen(true)} className="LogsButton">
        View logs
        </button>

        <Board 
        playerColor={this.state.color} 
        opponentMoveFrom={this.state.opponentMoveFrom}
        opponentMoveTo={this.state.opponentMoveTo}      
        playerPieces={this.state.playerPieces} 
        status={this.state.status} 
        setupCompleted={this.state.setupCompleted}
        sendMoveMessage={this.sendMoveMessage}
        addRemovedPieceToGallery={this.addRemovedPieceToGallery}
        onClickStartButton={this.sendSetupMessage}></Board>

    </>}
    </SideBar>)
  }
}
