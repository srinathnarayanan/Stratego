import { PieceMap, Status, Color } from "./ContentModels"

export interface Message {
    name: string,
    color: Color,
    roomNumber: string
}

export interface InitialMessage extends Message {
    initialPositions: PieceMap,
    status: Status,
    setupCompleted: boolean,
    opponentName: string
}

export interface SetupMessage extends Message {
    arrangedPositions: PieceMap,
    status: Status
}

export interface MoveMessage extends SetupMessage {
    status: Status,
    winnerKey: string,
    loserKey: string[],
    moveFromKey: string,
    moveToKey: string,
}

export interface StatusMessage extends Message {
    status: Status,
    setupCompleted: boolean,
    opponentName: string
}

export interface ErrorMessage extends Message {
    error: string
}