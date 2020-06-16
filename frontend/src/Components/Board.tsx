import * as React from 'react'
import { PieceMap, PieceContent, Status } from '../DataModels/ContentModels'
import { Square } from "./Square"

export interface BoardProps {
  playerPieces: PieceMap,
  status: Status,
  onClickStartButton: (pieces: PieceMap) => void
}

export interface BoardState {
  playerPieces: PieceMap,
  focusRowIndex: number,
  focusColumnIndex: number,
}


export class Board extends React.Component<BoardProps, BoardState> {
  
  constructor(props: BoardProps) {
    super(props);
    this.state = {
      playerPieces: props.playerPieces,
      focusRowIndex: undefined,
      focusColumnIndex: undefined
    }
  }

  onClick = (rowIndex: number, columnIndex: number) : void => {
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
        key={i} 
        onClick={(columnIndex: number) => this.onClick(rowIndex, columnIndex)}/>)
    }
    return rows;
  }

  render() {
    return( 
      <>
      <table className="center">
        <tbody>
         {this.renderBoardRows()}
        </tbody>
      </table>
      {this.props.status === Status.SetUp ? 
      <button onClick={() => this.props.onClickStartButton(this.state.playerPieces)}> Start game! </button>: <></>}   
      </>
      )
  }
}

interface BoardRowProps {
  rowIndex: number
  playerPieces: PieceMap,
  onClick: (columnIndex: number) => void,
  focusRowIndex: number,
  focusColumnIndex: number
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
        piece={this.state.playerPieces[key]} 
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

