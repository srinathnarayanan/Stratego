import { PieceMap, Status, Color, PieceContent } from "./ContentModels"

export interface Message {
    name: string,
    color: Color,
    roomNumber: string,
    enableAllLogs: boolean
}

export interface InitialMessage extends Message {
    initialPositions: PieceMap,
    status: Status,
    setupCompleted: boolean,
    opponentName: string
}

export interface SetupMessage extends Message {
    logMessage: string,
    arrangedPositions: PieceMap,
    status: Status
}

export interface MoveMessage extends SetupMessage {
    winnerKey: string,
    loserKey: string[] 
}

export interface StatusMessage extends Message {
    status: Status,
    setupCompleted: boolean,
    opponentName: string
}

export interface ErrorMessage extends Message {
    error: string
}