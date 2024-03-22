// @ts-nocheck
import './style.css';
import { VertexShaderSource } from './shaders/vertex-shader.ts';
import { FragmentShaderSource } from './shaders/fragment-shader.ts';
import { resizeCanvasToDisplaySize, createProgram, createShader } from './utils/web-gl.ts';
import { Point } from './classes/point.ts';
import { Line } from './classes/line.ts';
import { Shape } from './classes/shape.ts';

// Create WebGL program
let canvas: HTMLCanvasElement | null = document.querySelector<HTMLCanvasElement>('#webgl-canvas');
resizeCanvasToDisplaySize(<HTMLCanvasElement>canvas)
let gl = canvas!.getContext('webgl');

let vertexShader = createShader(gl, gl.VERTEX_SHADER, VertexShaderSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FragmentShaderSource);

let program = createProgram(gl, vertexShader, fragmentShader);


// Global variables
let isDrawing = false;
let objects: Shape[] = []
canvas?.addEventListener("mousedown", (e) => {
  const x = e.clientX
  const y = e.clientY
  const point = new Point(x, y)
  console.log(x, y);
  if (!isDrawing) {
    const line = new Line(objects.length, point);
    objects.push(line);

    isDrawing = true;
  } else {
    const line = objects[objects.length-1] as Line;
    line.setEndPoint(point);
    line.render(gl, program)

    isDrawing = false;
  }

})

canvas?.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const point = new Point(x, y)
  console.log(objects);

  const line: Line = objects[objects.length-1] as Line;
  line.setEndPoint(point);
  line.render(gl, program);
});
