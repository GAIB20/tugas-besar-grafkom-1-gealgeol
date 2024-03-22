import { Point } from './point.ts';
import { bindBuffer } from '../utils/web-gl.ts';
import { ShapeType } from '../enum/shape-type.ts';


export abstract class Shape {
  public id: number;
  public shapeType: ShapeType;
  public positions: Point[];

  public constructor(id: number, shapeType: ShapeType) {
    this.id = id;
    this.shapeType = shapeType;
    this.positions = [];
  }

  public getPositions() {
    let bufferPositions: number[] = [];
    this.positions.forEach((pos: Point) => bufferPositions.push(...pos.getCoordinate()));
    return new Float32Array(bufferPositions);
  }

  public getColors() {
    let bufferColors: number[] = [];
    this.positions.forEach((pos: Point) => bufferColors.push(...pos.getColor()));
    return new Float32Array(bufferColors);
  }


  abstract getPrimitiveType(gl: WebGLRenderingContext): number

  public render(gl: WebGLRenderingContext, bufferPos: WebGLBuffer, bufferColor: WebGLBuffer) {
    bindBuffer(gl, this.getPositions(), bufferPos);
    bindBuffer(gl, this.getColors(), bufferColor);
    const offset = 0;
    let count = this.positions.length;
    gl.drawArrays(this.getPrimitiveType(gl), offset, count);
  }
}