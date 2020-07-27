import * as React from 'react'
import SideBar from "react-sidebar"
import { ChatInput } from './JoinGameButton'
import { InitialMessage, StatusMessage, SetupMessage, ErrorMessage, Message, MoveMessage} from '../DataModels/MessageModels'
import { PieceMap, Status, Color, MessageTypes, MoveMessageParams, PieceContent, ElementMap, MoveStatus, LogMessageType} from '../DataModels/ContentModels'
import { Board } from './Board'

import * as io from 'socket.io-client'
import { Gallery } from './Gallery'
import { LogMessageComponent, LogMessageComponentProps } from './LogMessage'

const URL = process.env.REACT_APP_BACKEND_URL

interface LandingPageState {
  name: string,
  color: Color,
  roomNumber: string,
  receivedRoomNumber: string,
  messages: LogMessageComponentProps[],
  playerPieces: PieceMap,
  ws: SocketIOClient.Socket,
  setupCompleted: boolean,
  status: Status,
  sidebarOpen: boolean,
  removedPieces: PieceContent[],
  opponentName: string,
  opponentColor: Color,
  opponentMoveFrom: string,
  opponentMoveTo: string,
  winnerKey: string,
  loserKey: string[],
  statusAfterMove: Status,
  moveStatus: MoveStatus
} 

export class LandingPage extends React.Component<{}, LandingPageState> {
  constructor(props: any) {
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
      opponentName: undefined,
      opponentMoveFrom: undefined,
      opponentMoveTo: undefined,
      winnerKey: undefined,
      loserKey: undefined,
      statusAfterMove: undefined,
      moveStatus: MoveStatus.NotMoved,
      opponentColor: undefined
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
        setupCompleted: initialContent.setupCompleted,
        opponentName: initialContent.opponentName,
        opponentColor: initialContent.color === Color.Red ? Color.Blue : Color.Red
      });

      if (initialContent.opponentName) {
        this.addMessage({
          setupCompleted: initialContent.setupCompleted,
          name: initialContent.opponentName,
          color: this.state.opponentColor,
          type:LogMessageType.Join
        })  
      } 
      this.addMessage({
        setupCompleted: initialContent.setupCompleted,
        name: initialContent.name,
        color: initialContent.color,
        type: LogMessageType.Join
      })
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
      this.addMessage({
        type: LogMessageType.Setup,
        setupCompleted: true,
        name: this.state.opponentName,
        color: this.state.opponentColor      
      })
    })

    this.ws.on(MessageTypes.Move, async (data: any) => {
      const message = JSON.parse(data)
      const moveMessage = message as MoveMessage;
      var playerPieces = this.state.playerPieces

      this.processMove(playerPieces, moveMessage.moveFromKey, moveMessage.moveToKey)
      this.setState({playerPieces: playerPieces, 
        opponentMoveFrom: moveMessage.moveFromKey, 
        opponentMoveTo: moveMessage.moveToKey,
        winnerKey: moveMessage.winnerKey, 
        loserKey: moveMessage.loserKey, 
        statusAfterMove: moveMessage.status, 
        moveStatus: MoveStatus.NotMoved})
      this.forceUpdate()
    })

    this.ws.on(MessageTypes.Status, (data: any) => {
      const message = JSON.parse(data)
      const statusMessage = message as StatusMessage;
      if (!this.state.opponentName) {
        this.setState({opponentColor: this.state.color === Color.Red ? Color.Blue : Color.Red})
        this.addMessage({
          setupCompleted: statusMessage.setupCompleted,
          name: statusMessage.opponentName,
          color: this.state.opponentColor,
          type:LogMessageType.Join
        })  
      }
      if (statusMessage.status === Status.Paused) {
        this.addMessage({
          setupCompleted: statusMessage.setupCompleted,
          name: statusMessage.opponentName,
          color: this.state.opponentColor,
          type:LogMessageType.Leave
        })
      } else if (this.state.status === Status.Paused) {
        this.addMessage({
          setupCompleted: statusMessage.setupCompleted,
          name: statusMessage.opponentName,
          color: this.state.opponentColor,
          type:LogMessageType.Join
        })  
      }
      this.setState({
        status: statusMessage.status,
        setupCompleted: statusMessage.setupCompleted,
        opponentName: statusMessage.opponentName
      })
    })    

    this.ws.on('disconnect', () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: io.connect(URL)
      })
    })
  }

  processMove = (playerPieces: PieceMap, moveFromKey: string, moveToKey: string) : void => {
      if (playerPieces[moveToKey]) {
        playerPieces[moveToKey].inPlay = true
        playerPieces[moveFromKey].inPlay = true
      }
  }

  resetInPlay = (playerPieces: PieceMap, moveToKey: string) : void => {
    if (playerPieces[moveToKey]) {
      playerPieces[moveToKey].inPlay = false
    }
  }
  
  moveFromInfoButtonOnClick = () : void => {
    const loserKey = this.state.loserKey
    const winnerKey = this.state.winnerKey
    const moveFromKey = this.state.opponentMoveFrom
    const moveToKey = this.state.opponentMoveTo
    const playerPieces = this.state.playerPieces

    for (var i = 0; i < loserKey.length; i++) {
      if (playerPieces[loserKey[i]]) {
        this.addRemovedPieceToGallery(playerPieces[loserKey[i]])
      }
    }
    playerPieces[moveToKey] = playerPieces[winnerKey]
    delete playerPieces[moveFromKey]

    this.setState({playerPieces: playerPieces, moveStatus: MoveStatus.OpponentMoveFromCompleted})
  }

  moveToInfoButtonOnClick = () : void => {
    const moveToKey = this.state.opponentMoveTo
    const playerPieces = this.state.playerPieces
    this.resetInPlay(playerPieces, moveToKey)
    this.setState({
      playerPieces: playerPieces,
      loserKey: undefined, 
      winnerKey: undefined, 
      opponentMoveFrom: undefined, 
      opponentMoveTo: undefined,
      status: this.state.statusAfterMove,
      statusAfterMove: undefined,
      moveStatus: MoveStatus.NotMoved
    })
    this.forceUpdate()
    
    //this.addMessage(this.state.opponentName  + " finished a move.")
  }

  addMessage = (message: LogMessageComponentProps) : void => 
    this.setState(state => ({ messages: [message, ...state.messages] }))

  submitJoinGameMessage = () => {
    const message : Message = {
      name: this.state.name, 
      color: this.state.color, 
      roomNumber: this.state.roomNumber
    }
    this.ws.emit(MessageTypes.Join, JSON.stringify(message))
  }

  sendSetupMessage = (pieces: PieceMap) => {
    const message : SetupMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      arrangedPositions: pieces, 
      roomNumber: this.state.receivedRoomNumber,
      status: this.state.status,
    }
    this.ws.emit(MessageTypes.Setup, JSON.stringify(message))
    this.addMessage({
      type: LogMessageType.Setup,
      setupCompleted: true,
      name: this.state.name,
      color: this.state.color      
    })
  }

  sendMoveMessage = (moveMessageParams: MoveMessageParams) => {
    const message : MoveMessage = { 
      name: this.state.name, 
      color: this.state.color, 
      roomNumber: this.state.receivedRoomNumber,
      arrangedPositions: moveMessageParams.arrangePositions,
      status: moveMessageParams.isFlagTaken ? Status.Finished : this.state.status,
      winnerKey: moveMessageParams.winnerKey,
      loserKey: moveMessageParams.loserKey,
      moveFromKey: moveMessageParams.moveFromKey,
      moveToKey: moveMessageParams.moveToKey
    }
    this.ws.emit(MessageTypes.Move, JSON.stringify(message))
    //this.addMessage(this.state.name + " finished setup.")    
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
              {this.state.messages.map((props : LogMessageComponentProps) => {
              return <><LogMessageComponent key={(new Date()).toString()} {...props}/><br/></>
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
        onClickStartButton={this.sendSetupMessage}
        moveFromInfoButtonOnClick={this.moveFromInfoButtonOnClick}
        moveToInfoButtonOnClick={this.moveToInfoButtonOnClick}
        moveStatus={this.state.moveStatus}
        />
    </>}
    </SideBar>)
  }
}
