import * as React from 'react'
import { PieceContent, Color } from '../DataModels/ContentModels';

export interface GalleryProps {
    removedPieces: PieceContent[]
}

export class Gallery extends React.Component<GalleryProps> {
  
  constructor(props: GalleryProps) {
    super(props);
  }

  getImages () : JSX.Element[][] {
    var rows: JSX.Element[][][] = []
    var result: JSX.Element[][] = []

    rows[0] = [[]]
    rows[1] = [[]]
    result[0] = []
    result[1] = []

    for (var i = 0; i < this.props.removedPieces.length; i++) {   
        const piece = this.props.removedPieces[i]
        const imageName = piece.name + Color[piece.color]
        const imagePath = "/images/" + imageName + ".jpg"
        const image = <td><img src={imagePath}/></td>
        const coloredRow = rows[piece.color]

        // creating rows of 10 for each color
        if (coloredRow[coloredRow.length - 1].length === 10) {
          coloredRow.push([image])
        } else {
          coloredRow[coloredRow.length - 1].push(image)
        }
    }

    for (var colorIndex = 0; colorIndex <= 1; colorIndex++ ) {
      for (var rowIndex = 0; rowIndex < rows[colorIndex].length; rowIndex++) {
          var rowName = rowIndex == 0 ? <td rowSpan={rows[colorIndex].length}>{Color[colorIndex]}</td> : <></>
          result[colorIndex].push(<tr>{rowName}{rows[colorIndex][rowIndex]}</tr>)
      }
    }
    
    return result
  }

  render() {
      const images = this.getImages()
      return (     
        <table>
         <tbody>
           {images}
        </tbody>
        </table>
        )
  }
}
