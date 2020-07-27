export interface PieceContent {
    rank: number,
    index: number,
    name: string,
    inPlay: boolean,
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

export enum MoveStatus {
    NotMoved,
    OpponentMoveFromCompleted,
}

export class MessageTypes {
    static Join = "Join"
    static Setup = "Setup"
    static Move = "Move"
    static Status = "Status"
    static Error = "Error"
}

export enum LogMessageType {
    Join,
    Leave,
    Setup,
    MoveToEmpty,
    Attack,
    AttackWin,
    TakeOut,
}

export interface MoveMessageParams {
    arrangePositions: PieceMap,
    winnerKey: string,
    loserKey: string[],
    moveFromKey: string,
    moveToKey: string,
    pieces: PieceMap,
    isFlagTaken: boolean
}

export interface Result {
    winner: PieceContent,
    winnerIndex: string, 
    loser: PieceContent, 
    loserIndex: string
}

export type PieceMap = Record<string, PieceContent>;
export type ElementMap = Record<string, HTMLTableDataCellElement>;

