import * as React from 'react'
import { PieceContent, Color } from "../DataModels/ContentModels"

interface SquareProps {
    rowIndex: number
    columnIndex: number
    piece: PieceContent
    onClick: () => void,
    focusRowIndex: number,
    focusColumnIndex: number,
    possibleMoves: string[],
    playerColor: Color
}
  
export class Square extends React.Component<SquareProps> {
  
    getFocusClassName() : string {
        if (this.props.focusRowIndex === this.props.rowIndex && this.props.focusColumnIndex === this.props.columnIndex) {
            return "Focussed"
        } else if (this.props.possibleMoves.find(x => x === (this.props.columnIndex + "," + this.props.rowIndex))) {
            return this.props.playerColor === Color.Red ? "SemiFocussedRed" : "SemiFocussedBlue"
        } else {
            return "NotFocussed"
        }
    }
    
    constructor(props: SquareProps) {
      super(props)
      this.state = {
        piece: props.piece
      }
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
            <td className={focusClassName}>
                <img src={imagePath} onClick={this.props.onClick}/>
            </td>
        )
    }
}
  
  