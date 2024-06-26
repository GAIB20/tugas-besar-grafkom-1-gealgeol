import { ShapeType } from "../enum/shape-type";
import { convexHull } from "../utils/algorithms";
import { Wrapper } from "../utils/wrapper";
import { Point } from "./point";
import { Shape } from "./shape";

export class Polygon extends Shape {
    public constructor(id: number, points: Point[]) {
        super(id, ShapeType.POLYGON);
        this.positions = points;
    }

    public getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLE_FAN;
    }
    
    public arrangePositions() {
        if (this.positions.length < 3) return

        this.positions = convexHull(this.positions)
    }

    public deletePoint(point: Point) {
        if (this.positions.length < 4) {
            alert("Cannot delete point from polygon with <= 3 points.")
            return
        }
        this.positions = this.positions.filter((p) => !(p.x === point.x && p.y === point.y))
        this.arrangePositions()
    }

    public singlePointTranslate(oldPoint: Wrapper, x: number, y: number): void {
        const oldPointObj = oldPoint.obj as Point
        const point = this.positions.find(point => point === oldPointObj)!!
        point.x = x 
        point.y = y
        this.arrangePositions()
    }
}