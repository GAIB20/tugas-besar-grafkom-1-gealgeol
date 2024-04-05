import { Shape } from './shape.ts';
import { Point } from './point.ts';
import { ShapeType } from '../enum/shape-type.ts';

export class Line extends Shape {
  public length: number;

  public constructor(id: number, point: Point) {
    super(id, ShapeType.LINE);
    this.positions = [...this.positions, point];
    this.length = 0;
  }

  public getPrimitiveType(gl: WebGLRenderingContext): number {
    return gl.LINES;
  }

  public setEndPoint(point: Point) {
    if (!this.positions[1]) {
      this.positions[1] = point;
    } else {
      this.positions[1].x = point.x;
      this.positions[1].y = point.y;
    }
    this.length = this.positions[0].calculateEuclideanDist(point);
  }

  public updateLength(newLength: number) {
    const cos = (this.positions[1].x - this.positions[0].x) / this.length;
    const sin = (this.positions[1].y - this.positions[0].y) / this.length;

    this.positions[1].x = newLength * cos + this.positions[0].x;
    this.positions[1].y = newLength * sin + this.positions[0].y;
    this.length = newLength;
  }

  public setLength(newLength: number) {
    this.sx = 1 + (newLength-this.length)/this.length
    this.sy = 1 + (newLength-this.length)/this.length
    this.length = newLength
  }
}
