import { PieceMap, Status, Color } from "./ContentModels"

export interface Message {
    name: string,
    color: Color,
    roomNumber: string
}

export interface InitialMessage extends Message {
    initialPositions: PieceMap,
    status: Status,
    setupCompleted: boolean
}

export interface SetupMessage extends Message {
    logMessage: string,
    arrangedPositions: PieceMap,
    status: Status
}

export interface MoveMessage extends SetupMessage {
    winnerKey: string,
    loserKey: string 
}

export interface StatusMessage extends Message {
    status: Status,
    setupCompleted: boolean
}

export interface ErrorMessage extends Message {
    error: string
}