import './style.css';
import { VertexShaderSource } from './shaders/vertex-shader.ts';
import { FragmentShaderSource } from './shaders/fragment-shader.ts';
import { createProgram, createShader, resizeCanvasToDisplaySize } from './utils/web-gl.ts';
import { Point } from './classes/point.ts';
import { Line } from './classes/line.ts';
import { Shape } from './classes/shape.ts';
import { ShapeType } from './enum/shape-type.ts';
import { Rectangle } from './classes/rectangle.ts';
import { Polygon } from './classes/polygon.ts';
import { Square } from './classes/square.ts';
import { loadFile } from './utils/save-load.ts';

function main() {
  // Create WebGL program
  let _canvas: HTMLCanvasElement | null = document.querySelector<HTMLCanvasElement>('#webgl-canvas');
  const canvas = _canvas!!;

  let _gl = canvas.getContext('webgl');
  if (!_gl) {
    return;
  }
  const gl = _gl!!;

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, VertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FragmentShaderSource);
  let selectedShapeIndex: number | null = null;

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
      let shape = object as Shape;
      shape.render(gl, bufferPos, bufferCol);
    }

    window.requestAnimationFrame(renderCanvas);
  };

  document.querySelector('#line-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.LINE;
  });

  document.querySelector('#square-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.SQUARE;
  });

  document.querySelector('#rectangle-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.RECTANGLE;
  });

  document.querySelector('#polygon-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.POLYGON;
  });

  document.querySelector('#save-btn')?.addEventListener('click', function() {
    let jsonData = JSON.stringify(objects, null, 2);
    let blob = new Blob([jsonData], { type: 'application/json' });

    let a = document.createElement('a');
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'canvas.json';

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });

  document.querySelector('#load-btn')?.addEventListener('click', () => {
    loadFile().then((shapes) => objects = shapes);
    renderCanvas();
  });


  canvas.addEventListener('mousedown', (e) => {
    const x = e.offsetX;
    const y = canvas.height - e.offsetY;
    const point = new Point(x, y);

    switch (activeShape) {
      case ShapeType.LINE:
        if (!isDrawing) {
          const line = new Line(objects.length, point);
          objects.push(line);
          updateShapeDropdown('Line');
          document.getElementById('shape-dropdown')?.dispatchEvent(new Event('change'));

          isDrawing = true;
        } else {
          const line = objects[objects.length - 1] as Line;
          line.setEndPoint(point);
          line.render(gl, bufferPos, bufferCol);
          renderCanvas();
          isDrawing = false;
        }
        break;
      case ShapeType.SQUARE:
        if (!isDrawing) {
          const square = new Square(objects.length, point);
          objects.push(square);
          isDrawing = true;
        } else {
          const square = objects[objects.length - 1] as Square;
          square.updatePoint(point);
          square.render(gl, bufferPos, bufferCol);
          renderCanvas();
          isDrawing = false;
        }
        break;
      case ShapeType.RECTANGLE:
        if (!isDrawing) {
          const rectangle = new Rectangle(objects.length, []);
          rectangle.firstRef = point;
          objects.push(rectangle);
          isDrawing = true;
        } else {
          const rectangle = objects[objects.length - 1] as Rectangle;
          rectangle.secondRef = point;
          rectangle.arrangePositions();
          rectangle.render(gl, bufferPos, bufferCol);
          renderCanvas();
          isDrawing = false;
        }
        break;
      case ShapeType.POLYGON:
        if (!isDrawing) {
          const polygon = new Polygon(objects.length, []);
          polygon.references.push(point);
          polygon.arrangePositions();
          objects.push(polygon);
          isDrawing = true;
        } else {
          const polygon = objects[objects.length - 1] as Polygon;
          polygon.references.push(point);
          polygon.arrangePositions();
          polygon.render(gl, bufferPos, bufferCol);
          renderCanvas();
        }
        break;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const x = e.offsetX;
    const y = canvas.height - e.offsetY;
    const point = new Point(x, y);
    if (isDrawing) {
      switch (activeShape) {
        case ShapeType.LINE:
          const line: Line = objects[objects.length - 1] as Line;
          line.setEndPoint(point);
          line.render(gl, bufferPos, bufferCol);
          break;

        case ShapeType.SQUARE:
          const square: Square = objects[objects.length - 1] as Square;
          square.updatePoint(point);
          square.render(gl, bufferPos, bufferCol);
          break;

        case ShapeType.RECTANGLE:
          const rectangle = objects[objects.length - 1] as Rectangle;
          rectangle.secondRef = point;
          rectangle.arrangePositions();
          rectangle.render(gl, bufferPos, bufferCol);
          break;

      }
    }
  });

  function updateShapeDropdown(objName: string) {
    const dropdown = document.getElementById('shape-dropdown') as HTMLSelectElement;
    dropdown.innerHTML = '';
    objects.forEach((object, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.text = `${objName}-${index + 1}`;
      dropdown.appendChild(option);
    });
  }

  document.getElementById('slider-rotation')?.addEventListener('input', function (e) {
    const angle = (e.target as HTMLInputElement).valueAsNumber;
    console.log(selectedShapeIndex, angle);

    if (selectedShapeIndex !== null) {
      const selectedShape = objects[selectedShapeIndex];
      selectedShape.setRotation(angle);
      renderCanvas();
    }
  });

  // Event listener for dropdown selection changes
  document.getElementById('shape-dropdown')?.addEventListener('change', function () {
    selectedShapeIndex = parseInt((this as HTMLSelectElement).value, 10);
    document.getElementById('sidebar').style.display = 'block';
    document.getElementById('slider-x').value = 0;
    document.getElementById('slider-y').value = 0;
    document.getElementById('slider-length').value = 0;
    document.getElementById('slider-rotation').value = 0;

    const canvasWidth = Math.floor((canvas?.width || 0) / 2);
    const canvasHeight = Math.floor((canvas?.height || 0) / 2);
    document.getElementById('slider-x').setAttribute('min', (canvasWidth * -1).toString());
    document.getElementById('slider-x').setAttribute('max', canvasWidth.toString());
    document.getElementById('slider-y').setAttribute('min', (canvasHeight * -1).toString());
    document.getElementById('slider-y').setAttribute('max', canvasHeight.toString());

    // Update slider value displays
    document.getElementById('slider-x-value').textContent = 0;
    document.getElementById('slider-y-value').textContent = 0;
    document.getElementById('slider-length-value').textContent = 0;
    document.getElementById('slider-rotation-value').textContent = 0;
  });

  // Slider
  document.getElementById('slider-x')?.addEventListener('input', function () {
    document.getElementById('slider-x-value').textContent = this.value;
  });
  document.getElementById('slider-y')?.addEventListener('input', function () {
    document.getElementById('slider-y-value').textContent = this.value;
  });
  document.getElementById('slider-length')?.addEventListener('input', function () {
    document.getElementById('slider-length-value').textContent = this.value;
  });
  document.getElementById('slider-rotation')?.addEventListener('input', function () {
    document.getElementById('slider-rotation-value').textContent = this.value;
  });
}

main();
