import * as React from 'react'
import { Stack, TextField, IStackStyles, IStackProps, PrimaryButton, ITextFieldProps, Checkbox } from "office-ui-fabric-react";

interface TextFieldWrapperProps {
    textFieldProps: ITextFieldProps,
    reset: boolean
}

class TextFieldWrapper extends React.Component<TextFieldWrapperProps> {
    constructor(props: TextFieldWrapperProps) {
        super(props);
    }
    
    render() {
        if (this.props.reset) {
            return <TextField key={(new Date()).toString()} value="" {...this.props.textFieldProps}/>
        }
        return <TextField {...this.props.textFieldProps}/>
    }
}

export interface SignUpPageProps {
    submitJoinGameMessage: (name: string, roomNumber: string, enableAllLogs: boolean) => void
}

interface SignUpPageState {
    name: string,
    roomNumber: string,
    startRoomFocussed: boolean,
    enableAllLogs: boolean
}

export class SignUpPageComponent extends React.Component<SignUpPageProps, SignUpPageState> {
  
  private stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
  private columnProps: Partial<IStackProps> = {
    tokens: { childrenGap: 15 },
    styles: { root: { width: 300 } },
  };
  constructor(props: SignUpPageProps) {
    super(props);
    this.state = {
        name: undefined,
        roomNumber: undefined,
        startRoomFocussed: true,
        enableAllLogs: true
    }
  }

  render() {
      return (
    <Stack padding="10px" horizontal tokens={{ childrenGap: 50 }} styles={this.stackStyles}>
        <Stack {...this.columnProps}>
        <TextFieldWrapper 
        textFieldProps = {{
            label: "Name",
            placeholder: "Enter your name", 
            onChange: (e, newValue) => this.setState({ name: newValue }),
            onFocus: (e) => {
                this.setState({startRoomFocussed: true})
                this.setState({name: undefined})
            }
        }}
        reset={!this.state.startRoomFocussed}/>
        <Checkbox 
            label="Log everything!" 
            defaultChecked
            onChange={(e, isChecked) => this.setState({enableAllLogs: isChecked})}
            disabled={!this.state.startRoomFocussed} />
        <PrimaryButton 
            text="Start a game" 
            onClick={() => this.props.submitJoinGameMessage(this.state.name, undefined, this.state.enableAllLogs)} 
            allowDisabledFocus 
            disabled={!this.state.startRoomFocussed}/>
        </Stack>
        <Stack {...this.columnProps}>
        <TextFieldWrapper
        textFieldProps={{ 
            label: "Name", 
            placeholder: "Enter your name",
            onChange: (e, newValue) => this.setState({ name: newValue }),
            onFocus: (e) => {
                if (this.state.startRoomFocussed) {
                    this.setState({startRoomFocussed: false})
                    this.setState({name: undefined})
                    this.setState({roomNumber: undefined})
                }
            }
        }}
        reset={this.state.startRoomFocussed}/>
        <TextFieldWrapper
        textFieldProps={{
            label: "Room Code", 
            placeholder: "Enter room code to join", 
            disabled: this.state.startRoomFocussed,
            onChange: (e, newValue) => this.setState({ roomNumber: newValue }) 
        }}
        reset={this.state.startRoomFocussed}/>
        <PrimaryButton 
            text="Join existing game" 
            onClick={() => this.props.submitJoinGameMessage(this.state.name, this.state.roomNumber, undefined)} 
            allowDisabledFocus 
            disabled={this.state.startRoomFocussed}/>
        </Stack>
    </Stack>
      );
  }
}

