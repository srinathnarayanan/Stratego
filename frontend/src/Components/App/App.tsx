import * as React from 'react'
import './App.css'
import {LandingPage} from '../LandingPage'

export class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Stratego</h1>
        </header>
        <LandingPage />
      </div>
    )
  }
}

