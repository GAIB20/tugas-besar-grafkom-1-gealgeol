import { Color } from '../interfaces/color.ts';

export class Point {
  public x: number;
  public y: number;
  public color: Color;

  public constructor(x: number, y: number, color = [0, 0, 0, 1]) {
    this.x = x;
    this.y = y;
    this.color = {
      r: color[0],
      g: color[1],
      b: color[2],
      a: color[3],
    };
  }

  public getColor() {
    return [this.color.r, this.color.g, this.color.b, this.color.a];
  }

  public getCoordinate() {
    return [this.x, this.y];
  }
}