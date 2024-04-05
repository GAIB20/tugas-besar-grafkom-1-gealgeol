import { Shape } from './shape.ts';
import { Point } from './point.ts';
import { ShapeType } from '../enum/shape-type.ts';
import { Wrapper } from '../utils/wrapper.ts';

export class Line extends Shape {
  public constructor(id: number, point: Point) {
    super(id, ShapeType.LINE);
    this.positions = [...this.positions, point]
    console.log(this.positions);
  }

  public getPrimitiveType(gl: WebGLRenderingContext): number {
    return gl.LINES;
  }

  public setEndPoint(point: Point) {
    this.positions[1] = point;
  }

  public singlePointTranslate(oldPoint: Wrapper, x: number, y: number): void {
    const oldPointObj = oldPoint.obj as Point
    this.positions = this.positions.map((point) => {
      if (point == oldPointObj) {
        point.x = x;
        point.y = y
      }
      return point;
    });
  }
}