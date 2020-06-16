import { Status, PieceMap, PieceContent, Color } from "../DataModels/ContentModels"
  
export const getPossibleMoves = (playerPieces: PieceMap, rowIndex: number, columnIndex: number, playerColor: Color) : string[] => {
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
                    possibleMoves.push(key);
                } else {
                    if (playerPieces[key].color !== playerColor && playerPieces[key].color !== Color.Water) {
                        possibleMoves.push(key);
                    }
                    break;
                }
            }
        }
    }

    return possibleMoves
}

export const resolveRank = (focus: PieceContent, target: PieceContent) : {winner: PieceContent, loser: PieceContent} => {
    if (!target) {
        return {winner: focus, loser: target}
    } else if (target.name === "Bomb" && focus.name !== "Miner") {
        return {winner: target, loser: focus}
    } else if (focus.name === "Spy") {
        return {winner: focus, loser: target}
    } else if (focus.rank > target.rank) {
        return {winner: focus, loser: target}
    } else if (focus.rank < target.rank) {
        return {winner:target, loser: focus}
    } else {
        //both are same rank
        return undefined
    }
}