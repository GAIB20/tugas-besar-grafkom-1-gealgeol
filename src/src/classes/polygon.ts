import { ShapeType } from "../enum/shape-type";
import { convexHull } from "../utils/algorithms";
import { Point } from "./point";
import { Shape } from "./shape";

export class Polygon extends Shape {
    public references: Point[] = []
    public constructor(id: number, points: Point[]) {
        super(id, ShapeType.POLYGON);
        this.positions = points;
    }

    public getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLE_FAN;
    }
    
    public arrangePositions() {
        if (this.references.length < 3) return

        const sortedConvexPoints = convexHull(this.references)
        this.positions = sortedConvexPoints
    }
}