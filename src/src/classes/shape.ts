import { Point } from './point.ts';
import { bindBuffer } from '../utils/web-gl.ts';
import { ShapeType } from '../enum/shape-type.ts';
import { Transformation } from '../operations/transform.ts';
import { mat3, vec2 } from 'gl-matrix';

export abstract class Shape {
  public id: number;
  public shapeType: ShapeType;
  public positions: Point[];
  public tx: number;
  public ty: number;
  public degree: number;
  public sx: number;
  public sy: number;

  private transformation: Transformation = new Transformation();

  protected constructor(id: number, shapeType: ShapeType) {
    this.id = id;
    this.shapeType = shapeType;
    this.positions = [];
    this.tx = 0;
    this.ty = 0;
    this.degree = 0;
    this.sx = 1;
    this.sy = 1;
  }

  public getPositions() {
    let bufferPositions: number[] = [];
    this.positions.forEach((pos: Point) => bufferPositions.push(...pos.getCoordinate()));
    return new Float32Array(bufferPositions);
  }

  public getPoints() {
    return this.positions;
  }

  public getColors() {
    let bufferColors: number[] = [];
    this.positions.forEach((pos: Point) => bufferColors.push(...pos.getColor()));
    return new Float32Array(bufferColors);
  }

  public getCentroid() {
    const xValues = this.positions.map(p => p.x);
    const yValues = this.positions.map(p => p.y);
    const centroidX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const centroidY = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    return new Point(centroidX, centroidY);
  }

  abstract getPrimitiveType(gl: WebGLRenderingContext): number;

  public render(gl: WebGLRenderingContext, bufferPos: WebGLBuffer, bufferColor: WebGLBuffer) {
    bindBuffer(gl, this.getPositions(), bufferPos);
    bindBuffer(gl, this.getColors(), bufferColor);
    const offset = 0;
    let count = this.positions.length;
    gl.drawArrays(this.getPrimitiveType(gl), offset, count);
  }

  public applyTransformation() {
    const matrix = this.transformation.getMatrix();
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i].getCoordinate();
      const transformedPos = vec2.transformMat3(vec2.create(), vec2.fromValues(pos[0], pos[1]), matrix);
      this.positions[i].setCoordinate([transformedPos[0], transformedPos[1]]);
    }
  }

  public rotate(angle: number) {
    const centroid = this.getCentroid();

    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    this.positions = this.positions.map(point => {
      // Translate points to the origin
      let x = point.x - centroid.x;
      let y = point.y - centroid.y;

      // Apply rotation
      const rotatedX = x * cos - y * sin;
      const rotatedY = x * sin + y * cos;

      // Translate points back
      x = rotatedX + centroid.x;
      y = rotatedY + centroid.y;

      // Return the new point
      return new Point(x, y, point.getColor());
    });
  }

  public setRotation(angle: number) {
    this.rotate(this.degree-angle);
    this.degree = angle;
    this.applyTransformation();
  }

  public translate(newX: number, newY: number) {
    const dx = newX - this.tx;
    const dy = newY - this.ty;
   
    this.positions = this.positions.map(point => {
      return new Point(
        point.x + dx,
        point.y + dy,
        point.getColor()
      );
    });
    this.tx = newX;
    this.ty = newY;
  }
}

