import { Point } from "../classes/point";

function orientation(p1: Point, p2: Point, p3: Point): number {
    const val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
    if (val === 0) return 0; // Collinear
    return val > 0 ? 1 : 2; // Clockwise or counterclockwise
}

function comparePoints(p1: Point, p2: Point): number {
    return p1.y - p2.y || p1.x - p2.x;
}

export function convexHull(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Find the point with the lowest y-coordinate (and leftmost if tied)
    const lowestPoint = points.reduce((lowest, curr) => (comparePoints(curr, lowest) < 0 ? curr : lowest));

    // Sort points by polar angle with respect to the lowest point
    const sortedPoints = points
        .filter(p => !p.equals(lowestPoint))
        .sort((a, b) => {
            const angleA = Math.atan2(a.y - lowestPoint.y, a.x - lowestPoint.x);
            const angleB = Math.atan2(b.y - lowestPoint.y, b.x - lowestPoint.x);
            return angleA - angleB;
        });

    const hull: Point[] = [lowestPoint, sortedPoints[0]];

    for (let i = 1; i < sortedPoints.length; i++) {
        while (hull.length >= 2 && orientation(hull[hull.length - 2], hull[hull.length - 1], sortedPoints[i]) !== 2) {
            hull.pop();
        }
        hull.push(sortedPoints[i]);
    }

    return hull;
}