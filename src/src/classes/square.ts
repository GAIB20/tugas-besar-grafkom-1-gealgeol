import { Shape } from './shape.ts';
import { ShapeType } from '../enum/shape-type.ts';
import { Point } from './point.ts';
import { copyArrayOfPoints } from '../utils/algorithms.ts';

export class Square extends Shape {
  public center: Point;
  public length: number;
  public diagonal: number;
  public oriPositions: Point[];

  public constructor(id: number, point: Point) {
    super(id, ShapeType.SQUARE);
    this.center = point;
    this.length = 0;
    this.diagonal = 0
    this.oriPositions = [];
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
    this.diagonal = 2 * this.center.calculateEuclideanDist(this.positions[0]);
    this.oriPositions = copyArrayOfPoints(this.positions)
  }

  public updateLength(newLength: number) {
    let halfDiagonal = this.center.calculateEuclideanDist(this.positions[0]);
    const cos = (this.positions[0].x - this.center.x) / halfDiagonal;
    const sin = (this.positions[0].y - this.center.y) / halfDiagonal;

    let newX = newLength * cos + this.center.x;
    let newY = newLength * sin + this.center.y;
    this.updatePoint(new Point(newX, newY));
  }

  public movePoint(dLength: number, pointIndex: number) {
    let posMove = this.positions[pointIndex]
    let oppositePos = this.positions[(pointIndex + 2) % 4]
    let cos = (this.oriPositions[pointIndex].x - this.oriPositions[(pointIndex + 2) % 4].x) / this.diagonal;
    let sin = (this.oriPositions[pointIndex].y - this.oriPositions[(pointIndex + 2) % 4].y) / this.diagonal;
    let dX = (this.diagonal + dLength) * cos + oppositePos.x;
    let dY = (this.diagonal + dLength) * sin + oppositePos.y;
    this.length = (this.diagonal + dLength) * cos

    posMove.x = dX
    posMove.y = dY

    this.center.x = (posMove.x + oppositePos.x) / 2
    this.center.y = (posMove.y + oppositePos.y) / 2

    this.positions[(pointIndex + 1) % 4].x = this.center.x - (posMove.y - this.center.y)
    this.positions[(pointIndex + 1) % 4].y = this.center.y + (posMove.x - this.center.x)
    this.positions[(pointIndex + 3) % 4].x = this.center.x + (posMove.y - this.center.y)
    this.positions[(pointIndex + 3) % 4].y = this.center.y - (posMove.x - this.center.x)
  }

  public applyTransformation() {
    super.applyTransformation();
    this.oriPositions = copyArrayOfPoints(this.positions)
  }
}