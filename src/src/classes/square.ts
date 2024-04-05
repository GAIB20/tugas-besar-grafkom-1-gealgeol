import { Shape } from './shape.ts';
import { ShapeType } from '../enum/shape-type.ts';
import { Point } from './point.ts';
import { Wrapper } from '../utils/wrapper.ts';

export class Square extends Shape {
  public center: Point;
  public length: number;

  public constructor(id: number, point: Point) {
    super(id, ShapeType.SQUARE);
    this.center = point;
    this.length = 0;
  }

  public getPrimitiveType(gl: WebGLRenderingContext): number {
    return gl.TRIANGLE_FAN;
  }

  public updatePoint(point: Point) {
    this.length = Math.abs((point.x - this.center.x) * 2);
    const oppositePoint = new Point(2 * this.center.x - point.x, 2 * this.center.y - point.y);
    if (this.positions.length === 0) {
      this.positions[0] = point;
      this.positions[1] = new Point(this.center.x - (point.y - this.center.y), this.center.y + (point.x - this.center.x));
      this.positions[2] = oppositePoint;
      this.positions[3] = new Point(this.center.x + (point.y - this.center.y), this.center.y - (point.x - this.center.x));
    } else {
      this.positions[0].setCoordinate([point.x, point.y]);
      this.positions[1].setCoordinate([this.center.x - (point.y - this.center.y), this.center.y + (point.x - this.center.x)]);
      this.positions[2].setCoordinate([oppositePoint.x, oppositePoint.y]);
      this.positions[3].setCoordinate([this.center.x + (point.y - this.center.y), this.center.y - (point.x - this.center.x)]);
    }
  }

  public updateLength(newLength: number) {
    let halfDiagonal = this.center.calculateEuclideanDist(this.positions[0]);
    const cos = (this.positions[0].x - this.center.x) / halfDiagonal;
    const sin = (this.positions[0].y - this.center.y) / halfDiagonal;

    let newX = newLength * cos + this.center.x;
    let newY = newLength * sin + this.center.y;
    this.updatePoint(new Point(newX, newY));
  }

}