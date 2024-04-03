import { mat3 } from 'gl-matrix'; // assuming you use gl-matrix for matrix math

export class Transformation {
  private rotationAngle: number;
  private transformationMatrix: mat3;

  constructor() {
    this.rotationAngle = 0;
    this.transformationMatrix = mat3.create(); // Identity matrix
  }

  public rotate(angleInDegrees: number) {
    this.rotationAngle = (this.rotationAngle + angleInDegrees) % 360;
    const angleInRadians = (this.rotationAngle * Math.PI) / 180;
    mat3.rotate(this.transformationMatrix, this.transformationMatrix, angleInRadians);
  }

  public getMatrix(): mat3 {
    return this.transformationMatrix;
  }
}