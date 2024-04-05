import { Shape } from './shape.ts';
import { ShapeType } from '../enum/shape-type.ts';
import { Point } from './point.ts';
import { Wrapper } from '../utils/wrapper.ts';

export class Square extends Shape {
  public center: Point;
  public constructor(id: number, point: Point) {
    super(id, ShapeType.SQUARE);
    this.center = point;
  }

  public getPrimitiveType(gl: WebGLRenderingContext): number {
    return gl.TRIANGLE_FAN;
  }

  public updatePoint(point: Point) {
    const oppositePoint = new Point(2*this.center.x - point.x, 2*this.center.y - point.y)
    this.positions[0] = point
    this.positions[1] = new Point(this.center.x - (point.y - this.center.y), this.center.y +(point.x - this.center.x))
    this.positions[2] = oppositePoint
    this.positions[3] = new Point(this.center.x + (point.y - this.center.y), this.center.y - (point.x - this.center.x))
  }

  public singlePointTranslate(oldPoint: Wrapper, x: number, y: number): void {
      this.updatePoint(new Point(x, y))
  }
}