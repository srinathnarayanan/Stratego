import * as socket from 'socket.io'

export type RoomMap = Record<string, RoomContent>;
export type SocketMap = Record<string, SocketContent>;

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
    ws: socket.Socket,
    lastActivityTimeInMs: number,
    setupCompleted: boolean
}

export interface RoomContent {
    player1: PlayerContent,
    player2: PlayerContent, 
    status: Status,
    prevStatus: Status,
    roomNumber: string
}

export interface SocketContent {
    id: string,
    roomNumber: string
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

export type PieceMap = Record<string, PieceContent>;
