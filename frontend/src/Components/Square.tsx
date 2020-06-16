import * as React from 'react'
import { PieceContent, Color } from "../DataModels/ContentModels"

interface SquareProps {
    rowIndex: number
    columnIndex: number
    piece: PieceContent
    onClick: () => void,
    focusRowIndex: number,
    focusColumnIndex: number
}
  
export class Square extends React.Component<SquareProps> {
  
    getFocusClassName() : string {
        return (this.props.focusRowIndex === this.props.rowIndex && this.props.focusColumnIndex === this.props.columnIndex) ?
        "Focussed" : "NotFocussed";
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
            imageName = this.props.piece.name
            if (this.props.piece.color === Color.Red) {
                imageName += "Red"
            } else if (this.props.piece.color === Color.Blue) {
                imageName += "Blue"
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
  
  