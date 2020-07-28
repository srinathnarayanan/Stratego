import * as React from 'react'
import { LogMessageComponent, LogMessageComponentProps } from './LogMessage'
import { LogMessageType } from '../DataModels/ContentModels'

interface MoveInfoBoxProps {
    addLog: (log: LogMessageComponentProps) => void,
    logProps: LogMessageComponentProps,
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
      if (!props.logProps) {
        props.onClick()
      }
    }

    render() {
        return (this.state.show && this.props.refElement && this.props.logProps)? 
        <div className="MoveInfoBox" 
        style={{
            margin: "20px",
            borderRadius: "20px",
            backgroundColor: "white", 
            padding:"5px",
            position: "absolute",
            }}>
            <LogMessageComponent {...this.props.logProps} />               
            <button onClick={() => {
                    this.props.onClick()
                    if (this.props.logProps.type !== LogMessageType.Attack) {
                        this.props.addLog(this.props.logProps)
                    }
                    this.setState({show: false})
                }}>Dismiss</button>
        </div> :
        <></> 
    }
}
  
  