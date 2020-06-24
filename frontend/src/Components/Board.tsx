import * as React from 'react'
import { PieceMap, PieceContent, Status, Color, MoveMessageParams } from '../DataModels/ContentModels'
import { Square } from "./Square"
import { getPossibleMoves, resolveRank } from "../GamePlay/MovePieces"

export interface BoardProps {
  playerColor: Color,
  playerPieces: PieceMap,
  status: Status,
  setupCompleted: boolean,
  addRemovedPieceToGallery: (removedPiece: PieceContent) => void,
  sendMoveMessage: (moveMessageParams: MoveMessageParams) => void,
  onClickStartButton: (pieces: PieceMap, logMessage: string) => void
}

export interface BoardState {
  playerPieces: PieceMap,
  focusRowIndex: number,
  focusColumnIndex: number,
  possibleMoves: string []
}  

export class Board extends React.Component<BoardProps, BoardState> {
  
  constructor(props: BoardProps) {
    super(props);
    this.state = {
      playerPieces: props.playerPieces,
      focusRowIndex: undefined,
      focusColumnIndex: undefined,
      possibleMoves: []
    }
  }

  onClick = (rowIndex: number, columnIndex: number) : void => {
    // on Setup, don't allow moves to invalid rows. Perform swap on valid move
    if (this.props.status === Status.Setup || this.props.status === Status.SetUpMidway) {
      if (this.props.setupCompleted) {
        alert("you have to wait for other player to finish setting up")
        return
      }
      if ((this.props.playerColor === Color.Red && rowIndex > 3) || (this.props.playerColor === Color.Blue && rowIndex < 6)) {
        alert("you can't move here during setup")
        return
      }

      if (this.state.focusRowIndex === undefined && this.state.focusRowIndex === undefined) {
        this.setState({focusRowIndex: rowIndex, focusColumnIndex: columnIndex})
      } else if (this.state.focusRowIndex === rowIndex && this.state.focusColumnIndex === columnIndex) {
        this.setState({focusRowIndex: undefined, focusColumnIndex: undefined})
      } else {
        const oldPieceKey = this.state.focusColumnIndex + "," + this.state.focusRowIndex
        const newPieceKey = columnIndex + "," + rowIndex  
        const playerPieces = this.state.playerPieces
        const oldPiece : PieceContent = playerPieces[oldPieceKey]
        const newPiece : PieceContent = playerPieces[newPieceKey]
        playerPieces[newPieceKey] = oldPiece
        playerPieces[oldPieceKey] = newPiece
        this.setState({playerPieces:playerPieces, focusRowIndex: undefined, focusColumnIndex: undefined})
      }
    } else if ((this.props.status === Status.WaitingForRed && this.props.playerColor === Color.Red) || 
                (this.props.status === Status.WaitingFoBlue && this.props.playerColor === Color.Blue)) {
                  // on your turn, focus on clicked box and possible moves
                  // move if second click is on possible move locations
                  if (this.state.focusRowIndex === undefined && this.state.focusRowIndex === undefined) {
                    var possibleMoves = getPossibleMoves(this.state.playerPieces, rowIndex, columnIndex, this.props.playerColor)
                    if (possibleMoves.length === 0) {
                      alert("you can't move this piece")
                      return
                    }
                    this.setState({focusRowIndex: rowIndex, focusColumnIndex: columnIndex, possibleMoves: possibleMoves})
                  } else if (this.state.focusRowIndex === rowIndex && this.state.focusColumnIndex === columnIndex) {
                    this.setState({focusRowIndex: undefined, focusColumnIndex: undefined, possibleMoves: []})
                  } else {
                    const targetPieceKey = columnIndex + "," + rowIndex
                    const focusPieceKey = this.state.focusColumnIndex + "," + this.state.focusRowIndex
                    if (this.state.possibleMoves.find(x => x === targetPieceKey)) {
                      
                      //if present in possible move locations, determine if it is a swap or a compare
                      const playerPieces = this.state.playerPieces
                      const focusPiece = playerPieces[focusPieceKey]
                      const targetpiece = playerPieces[targetPieceKey]
                      
                      var result = resolveRank(focusPiece, focusPieceKey, targetpiece, targetPieceKey, this.props.addRemovedPieceToGallery)
                      var logMessage: string
                      
                      if (result) {
                        if (result.loser) {
                          logMessage = result.winner.name + "(" + result.winner.rank + ") beat " + result.loser.name + "(" + result.loser.rank + ")"
                        } else {
                          logMessage = Color[result.winner.color] + " moved a piece to the empty space at " + targetPieceKey
                        }
                        playerPieces[targetPieceKey] = result.winner
                        
                      } else {
                        logMessage = focusPiece.name + "(" + focusPiece.rank + ") and " + targetpiece.name + "(" + targetpiece.rank + ") took each other out"
                        delete playerPieces[targetPieceKey]
                      }
                      delete playerPieces[focusPieceKey]
                      
                      this.setState({playerPieces: playerPieces, focusColumnIndex: undefined, focusRowIndex: undefined, possibleMoves: []}) 
                      this.props.sendMoveMessage({
                        winnerKey: result?.winnerIndex,
                        loserKey: result?.loserIndex,
                        pieces: this.state.playerPieces,
                        logMessage: logMessage,
                        isFlagTaken: result && result.loser && result.loser.name === "Flag"})
                    } else {
                    }
                  } 
    } else {
      if (this.props.status === Status.Finished) {
        alert("game Over!")
      } else if (this.props.status === Status.Paused) {
        alert("game paused, waiting for other player to rejoin!")
      } else {
        alert("you have to wait for other player to " + (this.props.status === Status.NotStarted ? "start" : "move"))
      }
    }
  }

  renderBoardRows() : JSX.Element[] {
    const rows : JSX.Element[] = []
    for (var i=0; i<10; i++) {
      const rowIndex = i;
      rows.push(<BoardRow 
        rowIndex={i} 
        focusRowIndex={this.state.focusRowIndex}
        focusColumnIndex={this.state.focusColumnIndex}
        playerPieces={this.state.playerPieces} 
        possibleMoves={this.state.possibleMoves}
        playerColor={this.props.playerColor}
        key={i} 
        onClick={(columnIndex: number) => this.onClick(rowIndex, columnIndex)}/>)
    }
    return rows;
  }


  onClickStartButton() : void {
    this.props.onClickStartButton(this.state.playerPieces, Color[this.props.playerColor] + " sent arranged pieces");
  }

  render() {
    return( 
      <div className="Board">
      <table className="center">
        <tbody>
         {this.renderBoardRows()}
        </tbody>
      </table>
      {this.props.status === Status.Setup || Status.SetUpMidway ? 
      <button className={this.props.setupCompleted || this.props.status === Status.NotStarted ? "Invisible" : "Visible"} onClick={() => this.onClickStartButton()}> Start game! </button>: <></>}   
      </div>
      )
  }
}

interface BoardRowProps {
  rowIndex: number
  playerPieces: PieceMap,
  onClick: (columnIndex: number) => void,
  focusRowIndex: number,
  focusColumnIndex: number,
  possibleMoves: string[],
  playerColor: Color
}

interface BoardRowState {
  playerPieces: PieceMap
}


class BoardRow extends React.Component<BoardRowProps, BoardRowState> {

  constructor(props: BoardRowProps) {
    super(props)
    this.state = {
      playerPieces: props.playerPieces,
    }
  }

  onClick = (columnIndex: number) : void => {
    this.props.onClick(columnIndex)
  }

  renderBoardSquares() : JSX.Element[] {
    const squares : JSX.Element[] = []
    for(var i=0; i<10; i++) {
      const key = i.toString() + "," + this.props.rowIndex.toString();
      const columnIndex = i;
      squares.push(<Square key={key} 
        rowIndex={this.props.rowIndex}
        columnIndex={columnIndex} 
        focusRowIndex={this.props.focusRowIndex}
        focusColumnIndex={this.props.focusColumnIndex}
        possibleMoves={this.props.possibleMoves}
        piece={this.state.playerPieces[key]}
        playerColor={this.props.playerColor} 
        onClick={() => {this.onClick(columnIndex)}}/>)
    }
    return squares;
  }

  render() {
    return (
      <tr>
        {this.renderBoardSquares()}
      </tr>
    )
  }
}

