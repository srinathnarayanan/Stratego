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

export type PieceMap = Record<string, PieceContent>;
