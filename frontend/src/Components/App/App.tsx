import * as React from 'react'
import './App.css'
import Chat from '../Chat'

export class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Stratego</h1>
        </header>
        <Chat />
      </div>
    )
  }
}

