import { Shape } from './shape.ts';
import { Point } from './point.ts';
import { ShapeType } from '../enum/shape-type.ts';

export class Line extends Shape {
  public length: number;
  public oriLength: number;

  public constructor(id: number, point: Point) {
    super(id, ShapeType.LINE);
    this.positions = [...this.positions, point];
    this.length = 0;
    this.oriLength = 0;
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
    this.oriLength = this.length
  }

  public movePoint(dLength: number, pointIndex: number) {
    let posMove = this.positions[pointIndex]
    let oppositePos = this.positions[(pointIndex + 1) % 2]
    const cos = (posMove.x - oppositePos.x) / this.length;
    const sin = (posMove.y - oppositePos.y) / this.length;

    let newLength = this.oriLength + dLength
    posMove.x = newLength * cos + oppositePos.x;
    posMove.y = newLength * sin + oppositePos.y;
    this.length = newLength;
  }

  public updateLength(newLength: number) {
    this.sx = 1 + (newLength-this.length)/this.length
    this.sy = 1 + (newLength-this.length)/this.length
    this.length = newLength
    this.oriLength = newLength
  }
}
