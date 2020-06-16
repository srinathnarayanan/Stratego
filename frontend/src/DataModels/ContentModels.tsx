export interface PieceContent {
    rank: number,
    index: number,
    name: string,
    inPlay: boolean,
    color: Color
}

export interface CustomWebSocketContent {
    ws: WebSocket,
    id: string
}

export interface PlayerContent {
    color: Color
    name: string
    pieces: PieceMap
    customWs: CustomWebSocketContent
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
    SetUp,
    Started,
    Paused
}

export type PieceMap = Record<string, PieceContent>;
