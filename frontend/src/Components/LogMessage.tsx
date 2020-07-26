import * as React from 'react'
import { LogMessageType, PieceContent, Color } from '../DataModels/ContentModels'

export interface AttackLogMessageProps {
  type: LogMessageType,
  source: PieceContent,
  target: PieceContent
}

export interface JoinLogMessageProps {
  type: LogMessageType,
  setupCompleted: boolean,
  name: string,
  color: Color
}

export type LogMessageComponentProps = AttackLogMessageProps | JoinLogMessageProps

export class LogMessageComponent extends React.Component<LogMessageComponentProps> {

    private sourceImageName : string
    private targetImageName : string
    private message : string

    constructor(props: LogMessageComponentProps) {
      super(props)
      switch (this.props.type) {
        case LogMessageType.Attack:
          this.message = "attacked"
          const attackLogProps = this.props as AttackLogMessageProps
          if (attackLogProps.source) {
            this.sourceImageName = "/images/" + attackLogProps.source.name + Color[attackLogProps.source.color] + ".jpg"
          }
          if (attackLogProps.target) {
            this.targetImageName = "/images/" + attackLogProps.target.name + Color[attackLogProps.target.color] + ".jpg"
          }
          break;

        case LogMessageType.Join:
          const joinLogProps = this.props as JoinLogMessageProps
          this.sourceImageName = "/images/Blocked" + Color[joinLogProps.color] + ".jpg"
          const subMessage = joinLogProps.setupCompleted ? " re-joined" : " joined"
          this.message = joinLogProps.name + subMessage
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
  
  