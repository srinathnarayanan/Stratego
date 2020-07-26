import * as React from 'react'
import { PieceContent, LogMessageType } from '../DataModels/ContentModels'
import { LogMessageComponent } from './LogMessage'

interface MoveInfoBoxProps {
    piece: PieceContent
    playerMoveToEmptySpot: boolean
    show: boolean,
    refElement: HTMLTableDataCellElement,
    onClick: () => void
}

interface MoveInfoBoxState {
    show: boolean
}
  
export class MoveInfoBoxComponent extends React.Component<MoveInfoBoxProps, MoveInfoBoxState> {

    constructor(props: MoveInfoBoxProps) {
      super(props)
      this.state = {
          show: this.props.show
      }
      if (props.playerMoveToEmptySpot) {
        props.onClick()
      }
    }

    render() {
        return (this.state.show && this.props.refElement && !this.props.playerMoveToEmptySpot)? 
        <div className="MoveInfoBox" 
        style={{
            margin: "20px",
            borderRadius: "20px",
            backgroundColor: "white", 
            padding:"5px",
            position: "absolute",
            }}>
            <LogMessageComponent source={this.props.piece} target={this.props.piece} type={LogMessageType.Attack} />               
            <button onClick={() => {
                    this.props.onClick()
                    this.setState({show: false})
                }}>Dismiss</button>
        </div> :
        <></> 
    }
}
  
  