import { Point } from '../classes/point';
import { Shape } from '../classes/shape';

function rotate(shape: Shape, angleInDegrees: number) {
    const dAngle = shape.degree - angleInDegrees;
    const centroid = shape.getCentroid();

    const angleRad = (dAngle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    shape.positions = shape.positions.map(point => {
        // Translate points to the origin
        let x = point.x - centroid.x;
        let y = point.y - centroid.y;

        // Apply rotation
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;

        // Translate points back
        x = rotatedX + centroid.x;
        y = rotatedY + centroid.y;

        // Return the new point
        return new Point(x, y, point.getColor());
    });
    shape.degree = angleInDegrees;
    shape.applyTransformation();
}

function translate(shape: Shape, tx: number, ty: number) {
    const dx = tx - shape.tx;
    const dy = ty - shape.ty;

    shape.positions = shape.positions.map(point => {
        return new Point(
            point.x + dx,
            point.y + dy,
            point.getColor()
        );
    });
    shape.tx = tx;
    shape.ty = ty;
}

function scale(shape: Shape, sx: number, sy: number) {
    const centroid = shape.getCentroid();
  
    shape.positions = shape.positions.map(point => {
      let x = point.x - centroid.x;
      let y = point.y - centroid.y;
  
      x *= sx;
      y *= sy;
      
      x += centroid.x;
      y += centroid.y;
  
      return new Point(x, y, point.getColor());
    });
  
    shape.applyTransformation();
  }

export { rotate, translate, scale };