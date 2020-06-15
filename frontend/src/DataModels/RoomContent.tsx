export interface Piece {
    rank: number,
    index: number,
    name: string
    inPlay: boolean,
    color: Color
}

export interface CustomWebSocket {
    ws: WebSocket,
    id: string
}

export interface PlayerContent {
    color: Color
    name: string
    pieces: PieceMap
    customWs: CustomWebSocket
}

export enum Color {
    Red,
    Blue,
    Water
}

export enum Status {
    NotStarted,
    SetUp,
    Started,
    Paused
}

export interface RoomContent {
    player1: PlayerContent,
    player2: PlayerContent, 
    status: Status
}

export type PieceMap = Record<string, Piece>;
