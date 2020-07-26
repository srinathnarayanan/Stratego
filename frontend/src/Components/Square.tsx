import * as React from 'react'
import { PieceContent, Color, MoveStatus, LogMessageType } from "../DataModels/ContentModels"
import { MoveInfoBoxComponent } from './MoveInfoBox'
import { LogMessageComponent } from './LogMessage'

interface SquareProps {
    rowIndex: number,
    opponentMoveFrom: string,
    opponentMoveTo: string,
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
    targetPieceKey: string
}

export class Square extends React.Component<SquareProps> {

    private squareIndex : string
    private tdRef = React.createRef<HTMLTableDataCellElement>()

    getFocusClassName() : string {
        if (this.props.focusRowIndex === this.props.rowIndex && this.props.focusColumnIndex === this.props.columnIndex) {
            return "Focussed"
        } else if (this.props.possibleMoves.find(x => x === (this.squareIndex))) {
            return "SemiFocussed" + Color[this.props.playerColor]
        } else if (this.squareIndex === this.props.opponentMoveFrom || this.squareIndex === this.props.opponentMoveTo) {
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
        var playerMoveToEmptySpot = false
        if (this.squareIndex === this.props.opponentMoveFrom && this.props.moveStatus === MoveStatus.NotMoved) {
            onClick = this.props.moveFromInfoButtonOnClick
        } else if (this.squareIndex === this.props.opponentMoveTo &&
            this.props.moveStatus === MoveStatus.OpponentMoveFromCompleted) {
            onClick = this.props.moveToInfoButtonOnClick
        } else if (this.squareIndex === this.props.targetPieceKey) {
            onClick = this.props.playerMoveToInfoButtonOnClick
            if (!this.props.piece) {
                playerMoveToEmptySpot = true
            }
        }

        return  onClick ? 
            <> 
            <MoveInfoBoxComponent
                piece={this.props.piece}
                playerMoveToEmptySpot={playerMoveToEmptySpot}
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