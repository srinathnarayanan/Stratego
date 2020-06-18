import * as socket from 'socket.io'

export interface PieceContent {
    rank: number,
    index: number,
    name: string,
    inPlay: boolean,
    color: Color
}

export interface PlayerContent {
    color: Color
    name: string
    pieces: PieceMap
    ws: socket.Socket
}

export interface RoomContent {
    player1: PlayerContent,
    player2: PlayerContent, 
    status: Status
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
