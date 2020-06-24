export interface PieceContent {
    rank: number,
    index: number,
    name: string,
    isVisible: boolean,
    color: Color
}

export enum Color {
    Red,
    Blue,
    Water
}

export enum Status {
    NotStarted,
    Setup,
    SetUpMidway,
    WaitingForRed,
    WaitingFoBlue,
    Paused,
    Finished
}

export class MessageTypes {
    static Join = "Join"
    static Setup = "Setup"
    static Move = "Move"
    static Status = "Status"
    static Error = "Error"
}

export interface MoveMessageParams {
    winnerKey: string 
    loserKey: string
    logMessage: string
    pieces: PieceMap
    isFlagTaken: boolean
}

export type PieceMap = Record<string, PieceContent>;
