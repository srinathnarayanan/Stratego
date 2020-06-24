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
    var result: JSX.Element[][] = []
    result[0] = [<></>]
    result[1] = [<></>]
    for (var i = 0; i < this.props.removedPieces.length; i++) {   
        const piece = this.props.removedPieces[i]
        const imageName = piece.name + Color[piece.color]
        const imagePath = "/images/" + imageName + ".jpg" 
        result[piece.color].push(<td><img src={imagePath}/></td>)
    }
    return result
  }

  render() {
      const images = this.getImages()
      return (     
        <table>
         <tbody>
           <tr>
            <td>RED</td>{images[0]}
           </tr>  
            <tr>
             <td>BLUE</td>{images[1]}
            </tr>
         </tbody>
        </table>)
  }
}
