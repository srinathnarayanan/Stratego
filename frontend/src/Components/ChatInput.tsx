import * as React from 'react'

export interface ChatInputProps {
  onSubmitMessage: (message: string) => void,
  name: string
}

export interface ChatInputState {
  message: string
}

export class ChatInput extends React.Component<ChatInputProps, ChatInputState> {
  
  constructor(props: ChatInputProps) {
    super(props);
    this.state = {
      message: ''
    }
  }

  render() {
    return (
      <form
        action="."
        onSubmit={e => {
          e.preventDefault();
          this.props.onSubmitMessage(this.state.message);
          this.setState({ message: '' });
        }}
      >
      <input type="submit" value={this.props.name} />
      </form>
    )
  }
}

