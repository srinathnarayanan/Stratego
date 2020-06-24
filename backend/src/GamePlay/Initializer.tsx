import {Color, PieceContent, PieceMap} from "../DataModels/ContentModels"

export const initializePieces = (color: Color) : PieceMap => {
    var pieces : PieceMap = {}
    var newCoordinates : [number, number]
    const offset = color == Color.Red ? 0 : 6;

    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: [-1, 0], count: 1, rank: 10, name: "Marshall", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 1, rank: 9, name: "General", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 2, rank: 8, name: "Colonel", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 3, rank: 7, name: "Major", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 4, rank: 6, name: "Captain", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 4, rank: 5, name: "Lieutenant", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 4, rank: 4, name: "Sergeant", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 5, rank: 3, name: "Miner", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 8, rank: 2, name: "Scout", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 1, rank: 1, name: "Spy", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 6, rank: 0, name: "Bomb", color: color})
    newCoordinates = addPieces({pieces: pieces, offset:offset, prevCoordinates: newCoordinates, count: 1, rank: 0, name: "Flag", color: color})
    addDeadZones(pieces);

    return pieces
}

interface addPiecesParams {
    pieces: PieceMap,
    offset: number,
    prevCoordinates: [number, number],
    count: number,
    rank: number,
    name: string,
    color: Color
} 

const addPieces = (params: addPiecesParams) : [number, number] => {
    for (var i = 0; i < params.count; i++) {
      var newCoordinates = getNextPosition(params.prevCoordinates) 
      params.pieces[newCoordinates[0].toString() + "," +  (newCoordinates[1] + params.offset).toString()] = {
        rank: params.rank,
        index: i,
        name: params.name,
        inPlay: false,
        color: params.color
      }
      params.prevCoordinates = newCoordinates
    }
    return params.prevCoordinates;
}

const getNextPosition = (oldCoordinates: [number, number]) : [number, number] => {
    var x = oldCoordinates[0]
    var y = oldCoordinates[1]
    var xNew = x + 1 > 9 ? 0 : x + 1;
    var yNew = xNew === x + 1 ? y : y + 1;
    return [xNew, yNew]
}
  
const addDeadZones = (pieces: PieceMap) => {
  const deadZoneCoordinates = ["2,4", "3,4", "2,5",  "3,5", "6,4", "7,4", "6,5", "7,5",]
  for (var i = 0; i < 8; i++) {
    const imageIndex : number = i % 4
    pieces[deadZoneCoordinates[i]] = {rank: -1, index: i, name: "Water" + imageIndex.toString(), inPlay: false, color: Color.Water}
  }
}