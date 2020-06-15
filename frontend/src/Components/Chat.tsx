import * as React from 'react'
import { ChatInput } from './ChatInput'
import { InitialContent } from '../DataModels/InitialContent'
import { PieceMap } from '../DataModels/RoomContent'
import { Board } from './Board'

//import ChatMessage from './ChatMessage'

const URL = 'ws://localhost:3030/'
const RED = "red"
const BLUE = "blue"

interface ChatState {
  name: string,
  color: string,
  roomNumber: string,
  receivedRoomNumber: string,
  messages: string[],
  playerPieces: PieceMap,
  ws: WebSocket
} 

class Chat extends React.Component<{}, ChatState> {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Player 1',
      color: 'red',
      roomNumber: undefined,
      receivedRoomNumber: undefined,
      messages: [],
      playerPieces: {},
      ws: undefined
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
      if (!this.state.receivedRoomNumber) {
        const message = JSON.parse(evt.data)
        const initialContent = message as InitialContent
        if (initialContent) {
          this.setState({receivedRoomNumber: initialContent.roomNumber, playerPieces: initialContent.initialPositions});
        } else {
          alert(message.error);
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

  submitGameStartMessage = messageString => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    const message = { name: this.state.name, color: this.state.color, message: messageString, roomNumber: this.state.roomNumber }
    this.ws.send(JSON.stringify(message))
    alert(JSON.stringify(message));
    this.addMessage(message)
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
         Color:&nbsp;
          <input
            type="radio"
            name="red_color"
            checked={this.state.color === RED} 
            value={RED}
            onChange={e => this.setState({ color: e.target.value })}
          /> Red
          <input
            type="radio"
            name="blue_color"
            checked={this.state.color === BLUE} 
            value={BLUE}
            onChange={e => this.setState({ color: e.target.value })}
          /> Blue

        <ChatInput
          name="start a game"
          onSubmitMessage={messageString => this.submitGameStartMessage(messageString)}
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
          onSubmitMessage={messageString => this.submitGameStartMessage(messageString)}
         />

        </div>
      </div>
    ) :  
      <div>
        roomNumber: <h4>{this.state.receivedRoomNumber}</h4>
        <Board playerPieces={this.state.playerPieces}></Board>
      </div>
  }
}

export default Chat
