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

        this.positions = convexHull(this.references)
    }

    public deletePoint(point: Point) {
        if (this.positions.length < 4) {
            alert("Cannot delete point from polygon with <= 3 points.")
            return
        }
        this.references = this.references.filter((p) => !(p.x === point.x && p.y === point.y))
        this.arrangePositions()
    }
}