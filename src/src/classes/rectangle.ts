import { ShapeType } from "../enum/shape-type";
import { Wrapper } from "../utils/wrapper";
import { Point } from "./point";
import { Shape } from "./shape";

export class Rectangle extends Shape {
    public firstRef: Point | null = null;
    public secondRef: Point | null = null;

    public currLength: number = 0;
    public currWidth: number = 0;
    public length: number = 0;
    public width: number = 0;

    public constructor(id: number, points: Point[]) {
        super(id, ShapeType.RECTANGLE);
        this.positions = points;
    }

    public getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLE_FAN;
    }

    public setupWidthLength() {
        this.length = Math.abs(this.firstRef!!.x - this.secondRef!!.x)
        this.width = Math.abs(this.firstRef!!.y - this.secondRef!!.y)
        this.currLength = this.length
        this.currWidth = this.width
        console.log(this.length, this.width, this.currLength, this.currWidth    )
    }

    public setLength(dLength: number) {
        this.sx = (dLength + this.length)/this.currLength
        this.currLength = dLength+this.length
    }

    public setWidth(dWidth: number) {
        this.sy = (dWidth + this.width)/this.currWidth
        this.currWidth = dWidth+this.width
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
            console.log("ehre")
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
            _firstRef.x += xDif/2
            _secondRef.x += xDif/2
            _firstRef.y += yDif/2
            _secondRef.y += yDif/2 

        } else if (oldPointObj.equals(_secondRef)) {
            //
        }


    }


}