import { Matrix } from "./matrix";

export class Vector {
    x: number;
    y: number;
  
    constructor(x: number = 0, y: number = 0) {
      this.x = x;
      this.y = y;
    }

    static create(): Vector {
        return new Vector(0, 0);
      }
  
    static fromValues(x: number, y: number): Vector {
      return new Vector(x, y);
    }
  
    transformMat(matrix: Float32Array): this {
      const x = this.x, y = this.y;
      this.x = matrix[0] * x + matrix[4] * y + matrix[12];
      this.y = matrix[1] * x + matrix[5] * y + matrix[13];
      return this;
    }
  
    toArray(): number[] {
      return [this.x, this.y];
    }
  }