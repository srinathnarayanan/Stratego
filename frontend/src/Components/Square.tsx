import * as React from 'react'
import { PieceContent, Color, MoveStatus, LogMessageType, Result } from "../DataModels/ContentModels"
import { MoveInfoBoxComponent } from './MoveInfoBox'
import { LogMessageComponent, LogMessageComponentProps } from './LogMessage'

interface SquareProps {
    rowIndex: number,
    opponentMoveFromKey: string,
    opponentMoveFromPiece: PieceContent,
    opponentMoveToKey: string,
    opponentMoveToPiece: PieceContent,
    columnIndex: number,
    piece: PieceContent,
    onClick: () => void,
    focusRowIndex: number,
    focusColumnIndex: number,
    possibleMoves: string[],
    playerColor: Color,
    moveFromInfoButtonOnClick: () => void, 
    moveToInfoButtonOnClick: () => void,
    moveStatus: MoveStatus,
    playerMoveToInfoButtonOnClick: () => void,
    addLog: (log: LogMessageComponentProps) => void,
    targetPieceKey: string,
    focusPiece: PieceContent
}

export class Square extends React.Component<SquareProps> {

    private squareIndex : string
    private tdRef = React.createRef<HTMLTableDataCellElement>()

    getFocusClassName() : string {
        if (this.props.focusRowIndex === this.props.rowIndex && this.props.focusColumnIndex === this.props.columnIndex) {
            return "Focussed"
        } else if (this.props.possibleMoves.find(x => x === (this.squareIndex))) {
            return "SemiFocussed" + Color[this.props.playerColor]
        } else if (this.squareIndex === this.props.opponentMoveFromKey || this.squareIndex === this.props.opponentMoveToKey) {
            return "Focussed"
        } else {
            return "NotFocussed"
        }
    }
    
    constructor(props: SquareProps) {
      super(props)
      this.squareIndex = this.props.columnIndex + "," + this.props.rowIndex
    }

    displayComponent() : JSX.Element{
        var onClick: () => void 
        var logProps: LogMessageComponentProps
        if (this.squareIndex === this.props.opponentMoveFromKey && this.props.moveStatus === MoveStatus.NotMoved) {
            // received move, 1st part taking place
            onClick = this.props.moveFromInfoButtonOnClick
            if (this.props.opponentMoveToPiece) {
                logProps = {
                    type: LogMessageType.Attack,
                    source: this.props.opponentMoveFromPiece,
                    target: this.props.opponentMoveToPiece
                }
            }
        } else if (this.squareIndex === this.props.opponentMoveToKey &&
            this.props.moveStatus === MoveStatus.OpponentMoveFromCompleted) {
            // received move, 2nd part taking place
            onClick = this.props.moveToInfoButtonOnClick
            if (!this.props.opponentMoveToPiece) {
            // move to empty received
                logProps = {
                    type: LogMessageType.MoveToEmpty,
                    color: this.props.playerColor === Color.Red ? Color.Blue : Color.Red,
                    emptySpotKey: this.squareIndex 
                } 
            } else {
            // attacking a piece
            if ((this.props.opponentMoveFromPiece.rank > this.props.opponentMoveToPiece.rank) && (this.props.opponentMoveToPiece.name !== "Bomb" || this.props.opponentMoveFromPiece.rank === 3)) {
                // from wins over to
                    logProps = {
                        type: LogMessageType.AttackWin,
                        source: this.props.opponentMoveFromPiece,
                        target: this.props.opponentMoveToPiece
                    }
                } else {
                // to wins over from or draws
                    logProps = {
                        type: this.props.opponentMoveFromPiece.rank === this.props.opponentMoveToPiece.rank ? LogMessageType.TakeOut : LogMessageType.AttackWin,
                        source: this.props.opponentMoveToPiece,
                        target: this.props.opponentMoveFromPiece
                    }
                }
            }
        } else if (this.squareIndex === this.props.targetPieceKey) {
            // performing move
            onClick = this.props.playerMoveToInfoButtonOnClick
            if (this.props.piece) {
                if ((this.props.piece.rank < this.props.focusPiece.rank) && (this.props.piece.name !== "Bomb" || this.props.focusPiece.rank === 3)) {
                // attack and win
                    logProps = {
                        type: LogMessageType.AttackWin,
                        source: this.props.focusPiece,
                        target: this.props.piece
                    }
                } else {
                // attack and lose or draw
                    logProps = {
                        type: this.props.piece.rank === this.props.focusPiece.rank ? LogMessageType.TakeOut : LogMessageType.AttackWin,
                        source: this.props.piece,
                        target: this.props.focusPiece
                    }
                }
            } else {
                // update logs with move to empty space
                this.props.addLog({
                    type: LogMessageType.MoveToEmpty,
                    color: this.props.playerColor,
                    emptySpotKey: this.squareIndex
                })
            }
        }

        return  onClick ? 
            <> 
            <MoveInfoBoxComponent
                addLog={this.props.addLog}
                logProps={logProps}
                show={true}
                refElement={this.tdRef.current}
                onClick={onClick}/>
            </>
            : <></>  
    }

    render() {
        const focusClassName = this.getFocusClassName();
        var imageName: string
        if (this.props.piece) {
            if (this.props.piece.color === this.props.playerColor || this.props.piece.inPlay) {
                imageName = this.props.piece.name + Color[this.props.piece.color]
            } else if (this.props.piece.color === Color.Water) {
                imageName = this.props.piece.name
            } else {
                imageName = "Blocked" + Color[this.props.piece.color]
            }
        } else {
            imageName = "Empty"
        }

        const imagePath = "/images/" + imageName + ".jpg"
        return (
            <>
            <td className={focusClassName} ref={this.tdRef}>
                <img src={imagePath} onClick={this.props.onClick}/>
                {this.displayComponent()}
            </td>
            </>
        )
    }
}