import * as React from 'react'
import { LogMessageType, PieceContent, Color } from '../DataModels/ContentModels'

export interface AttackLogMessageProps {
  type: LogMessageType,
  source: PieceContent,
  target: PieceContent
}

export interface ConnectLogMessageProps {
  type: LogMessageType,
  setupCompleted: boolean,
  name: string,
  color: Color
}

export interface MoveToEmptySpaceLogMessageProps {
  type: LogMessageType,
  color: Color
  emptySpotKey: string
}

export type LogMessageComponentProps = AttackLogMessageProps | ConnectLogMessageProps | MoveToEmptySpaceLogMessageProps

export class LogMessageComponent extends React.Component<LogMessageComponentProps> {

    private sourceImageName : string
    private targetImageName : string
    private message : string

    constructor(props: LogMessageComponentProps) {
      super(props)
      switch (this.props.type) {        
        case LogMessageType.Leave:
        case LogMessageType.Join:
        case LogMessageType.Setup:
          const connectLogProps = this.props as ConnectLogMessageProps
          this.sourceImageName = "/images/Blocked" + Color[connectLogProps.color] + ".jpg"
          var subMessage : string
          switch (connectLogProps.type) {
            case LogMessageType.Join:
              subMessage = connectLogProps.setupCompleted ? " re-joined" : " joined"
              break;
            case LogMessageType.Leave:
              subMessage = " left the game. Game paused until they re-join."
              break;
            case LogMessageType.Setup:
              subMessage = " completed setup."
              break;
          }
          this.message = connectLogProps.name + subMessage
          break;

        case LogMessageType.MoveToEmpty: 
          const moveToEmptySpotParams = this.props as MoveToEmptySpaceLogMessageProps
          this.message = " moved to the empty spot at " + moveToEmptySpotParams.emptySpotKey
          this.sourceImageName = "/images/Blocked" + Color[moveToEmptySpotParams.color] + ".jpg"

        default:
          const attackLogProps = this.props as AttackLogMessageProps
          switch (attackLogProps.type) {
            case LogMessageType.Attack:
              this.message = "attacked"
              break;
            case LogMessageType.AttackWin:
              this.message = "defeated"
              break;
            case LogMessageType.TakeOut:
              this.message = "took out"
              break;
          }
          this.sourceImageName = "/images/" + attackLogProps.source.name + Color[attackLogProps.source.color] + ".jpg"
          this.targetImageName = "/images/" + attackLogProps.target.name + Color[attackLogProps.target.color] + ".jpg"
          break;

      }
    }

    render() {
        return <div style={{padding: "10px"}}>
          {this.sourceImageName ? <img style={{display: "inline-block", verticalAlign:"middle"}} src={this.sourceImageName}/> : <></>}
          <span style={{display: "inline-block", padding: "10px"}}><b>  {this.message}  </b></span>
          {this.targetImageName ? <img style={{display: "inline-block", verticalAlign:"middle"}} src={this.targetImageName}/> : <></>}
          </div> 
    }
}
  
  