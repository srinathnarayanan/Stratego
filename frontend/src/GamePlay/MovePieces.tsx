import { Status, PieceMap, PieceContent, Color, Result } from "../DataModels/ContentModels"
  
export const getPossibleMoves = (playerPieces: PieceMap, rowIndex: number, columnIndex: number, playerColor: Color, findFirstPossibleMove: boolean) : string[] => {
    var possibleMoves : string[]
    possibleMoves = []

    const clickedSquareKey = columnIndex + "," + rowIndex
    const clickedPiece = playerPieces[clickedSquareKey]

    if (!clickedPiece || clickedPiece.color !== playerColor || clickedPiece.rank <= 0) {
        return [];
    }

    var maxIndexDifference = 1;
    if (clickedPiece.name === "Scout") {
        maxIndexDifference = 10;
    }

    var indexers = [[0, 1], [0, -1], [1, 0], [-1, 0]]
        for (var j = 0; j < 4; j ++) {
            for (var i = 1; i <= maxIndexDifference; i++) {
            var row = rowIndex + (indexers[j][0]) * i;
            var col = columnIndex + (indexers[j][1] * i)
            if (row >= 0 && row <= 9 && col >= 0 && col <= 9) {
                var key = col + "," + row
                if (!playerPieces[key]) {
                    if (findFirstPossibleMove) {
                        return [key]
                    }
                    possibleMoves.push(key);
                } else {
                    if (playerPieces[key].color !== playerColor && playerPieces[key].color !== Color.Water) {
                        if (findFirstPossibleMove) {
                            return [key]
                        }    
                        possibleMoves.push(key);
                    }
                    break;
                }
            }
        }
    }

    return possibleMoves
}

export const resolveRank = (focus: PieceContent, focusIndex:string, target: PieceContent, targetIndex: string, addRemovedPieceToGallery: (piece: PieceContent) => void) :
Result => {
    if (!target) {
        return {winner: focus, winnerIndex: focusIndex, loser: target, loserIndex: targetIndex}
    } else if (target.name === "Bomb" && focus.name !== "Miner") {
        addRemovedPieceToGallery(focus)
        return {winner: target, winnerIndex: targetIndex, loser: focus, loserIndex: focusIndex}
    } else if (focus.name === "Spy") {
        addRemovedPieceToGallery(target)
        return {winner: focus, winnerIndex: focusIndex, loser: target, loserIndex: targetIndex}
    } else if (focus.rank > target.rank) {
        addRemovedPieceToGallery(target)
        return {winner: focus, winnerIndex: focusIndex, loser: target, loserIndex: targetIndex}
    } else if (focus.rank < target.rank) {
        addRemovedPieceToGallery(focus)
        return {winner:target, winnerIndex: targetIndex, loser: focus, loserIndex: focusIndex}
    } else {
        //both are same rank
        addRemovedPieceToGallery(focus)
        addRemovedPieceToGallery(target)
        return undefined
    }
}