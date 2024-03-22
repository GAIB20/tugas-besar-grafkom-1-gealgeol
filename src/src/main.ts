import './style.css';
import { VertexShaderSource } from './shaders/vertex-shader.ts';
import { FragmentShaderSource } from './shaders/fragment-shader.ts';
import { createProgram, createShader, resizeCanvasToDisplaySize } from './utils/web-gl.ts';
import { Point } from './classes/point.ts';
import { Line } from './classes/line.ts';
import { Shape } from './classes/shape.ts';
import { ShapeType } from './enum/shape-type.ts';

function main() {
  // Create WebGL program
  let canvas: HTMLCanvasElement | null = document.querySelector<HTMLCanvasElement>('#webgl-canvas');

  let gl = canvas!.getContext('webgl');
  if (!gl) {
    return;
  }

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, VertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    return;
  }

  let program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    return;
  }

  resizeCanvasToDisplaySize(<HTMLCanvasElement>canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  const bufferPos = gl.createBuffer();
  const bufferCol = gl.createBuffer();

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, stride, offset);

  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCol);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, stride, offset);

  if (!bufferCol || !bufferPos) {
    return;
  }

  let resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // GLOBALS
  let isDrawing = false;
  let objects: Shape[] = [];
  let activeShape: ShapeType = ShapeType.LINE;

  const renderCanvas = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const object of objects) {
      object.render(gl, bufferPos, bufferCol);
    }

    window.requestAnimationFrame(renderCanvas);
  };

  document.querySelector("#line-btn")?.addEventListener('click', () => {
    activeShape = ShapeType.LINE;
  })

  canvas?.addEventListener('mousedown', (e) => {
    const x = e.offsetX;
    const y = canvas.height - e.offsetY;
    const point = new Point(x, y);

    switch (activeShape) {
      case ShapeType.LINE:
        if (!isDrawing) {
          const line = new Line(objects.length, point);
          objects.push(line);

          isDrawing = true;
        } else {
          const line = objects[objects.length - 1] as Line;
          line.setEndPoint(point);
          line.render(gl, bufferPos, bufferCol);
          renderCanvas()

          isDrawing = false;
        }
    }

  });

  canvas?.addEventListener('mousemove', (e) => {
    if (isDrawing) {
      switch (activeShape) {
        case ShapeType.LINE:
          const x = e.offsetX;
          const y = canvas.height - e.offsetY;
          const point = new Point(x, y);
          console.log(objects);

          const line: Line = objects[objects.length - 1] as Line;
          line.setEndPoint(point);
          line.render(gl, bufferPos, bufferCol);
      }
    }
  });
}

main();