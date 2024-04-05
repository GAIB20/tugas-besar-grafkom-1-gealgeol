export class Matrix {
    public data: Float32Array;

    constructor() {
        this.data = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0, 
            0, 0, 1, 0, 
            0, 0, 0, 1  
        ]);
    }
  
    static create(): Matrix {
        return new Matrix();
    }

}