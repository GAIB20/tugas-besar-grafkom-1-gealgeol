import { ShapeType } from "../enum/shape-type";
import { Wrapper } from "../utils/wrapper";
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
            new Point(maxX, maxY)
        ]
    }

    public singlePointTranslate(oldPoint: Wrapper, x: number, y: number): void {
        const oldPointObj = oldPoint.obj as Point 
        const _firstRef = this.firstRef!!
        const _secondRef = this.secondRef!!
        const center = new Point(
            (_firstRef.x + _secondRef.x) / 2,
            (_firstRef.y + _secondRef.y) / 2  
        )

        let gradVector = (_firstRef.y - _secondRef.y) / (_firstRef.x - _secondRef.x)


        if (oldPointObj.equals(_firstRef)) {
            let xDif = oldPointObj.x - x
            let yDif = oldPointObj.y - y
            
            if (xDif === 0 && yDif === 0) {
                return
            } else if (xDif === 0) {
                xDif = yDif/gradVector 
            } else if (yDif === 0) {
                yDif = xDif * gradVector
            } else {
                console.log("HELB")
            }
            _firstRef.x += xDif
            _firstRef.y += yDif
            this.arrangePositions() 
        } else if (oldPointObj.equals(_secondRef)) {
            //
        }
    }


}