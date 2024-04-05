import { Point } from '../classes/point';
import { Shape } from '../classes/shape';

function animateRotation(shape: Shape, angle: number): void {
    const centroid = shape.getCentroid();

    const angleRad = (angle * Math.PI) / 180;
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
    shape.degree = angle;
    shape.applyTransformation();
}

export { animateRotation};