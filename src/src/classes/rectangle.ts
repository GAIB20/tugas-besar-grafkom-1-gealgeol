import { ShapeType } from "../enum/shape-type";
import { Point } from "./point";
import { Shape } from "./shape";

export class Rectangle extends Shape {
    public firstRef: Point | null = null;
    public secondRef: Point | null = null;

    public constructor(id: number, points: Point[]) {
        super(id, ShapeType.RECTANGLE);
        this.positions = points;
    }

    public getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLE_FAN;
    }

    public arrangePositions() {
        const _firstRef = this.firstRef!!
        const _secondRef = this.secondRef!!
        const maxX = Math.max(_firstRef.x, _secondRef.x)
        const maxY = Math.max(_firstRef.y, _secondRef.y) 
        const minX = Math.min(_firstRef.x, _secondRef.x)
        const minY = Math.min(_firstRef.y, _secondRef.y)
        this.positions = [
            new Point(maxX, minY),
            new Point(minX, minY),
            new Point(minX, maxY),
            new Point(maxX, minY),
            new Point(minX, maxY),
            new Point(maxX, maxY)
        ]
    }
}