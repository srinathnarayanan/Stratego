import * as React from 'react'

export interface ChatInputProps {
  onSubmitMessage: () => void,
  name: string
}

export class ChatInput extends React.Component<ChatInputProps> {
  
  constructor(props: ChatInputProps) {
    super(props);
  }

  render() {
    return (
      <form
        action="."
        onSubmit={e => {
          e.preventDefault();
          this.props.onSubmitMessage();
          this.setState({ message: '' });
        }}
      >
      <input type="submit" value={this.props.name} />
      </form>
    )
  }
}

