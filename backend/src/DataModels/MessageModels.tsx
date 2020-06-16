import { PieceMap, Status, Color } from "./ContentModels"

export interface Message {
    name: string,
    color: Color,
    roomNumber: string,
    wsId: string
}

export interface InitialMessage extends Message {
    initialPositions: PieceMap,
    status: Status
}

export function instanceOfInitialMessage(object: any): object is InitialMessage {
    return 'initialPositions' in object && 'status' in object;
}

export interface ArrangedPiecesMessage extends Message {
    arrangedPositions: PieceMap
}

export function instanceOfArrangedPiecesMessage(object: any): object is ArrangedPiecesMessage {
    return 'arrangedPositions' in object;
}

export interface StatusMessage extends Message {
    status: Status
}

export function instanceOfStatusMessage(object: any): object is StatusMessage {
    return 'status' in object;
}

export interface ErrorMessage extends Message {
    error: string
}

export function instanceOfErrorMessage(object: any): object is ErrorMessage {
    return 'error' in object;
}
