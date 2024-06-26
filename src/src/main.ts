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
import { Wrapper } from './utils/wrapper.ts';
import { hexToRgb, rgbToHex } from './utils/tools.ts';
import { rotate, scale, translate } from './utils/transformations.ts';
import { animateRotation } from './utils/animation.ts';

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
  let selectedShapeIndex: number | null = null;
  let selectedPointIndex: number | null = null;

  const renderCanvas = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const object of objects) {
      let shape = object as Shape;
      shape.render(gl, bufferPos, bufferCol);
    }

    window.requestAnimationFrame(renderCanvas);
  };

  function updateShapeDropdown(objName: string) {
    const option = document.createElement('option');
    option.value = shapeDropdown.options.length.toString(); // Assigning the value based on the length of existing options
    option.text = `${objName}-${shapeDropdown.options.length + 1}`; // Generating text based on the length of existing options
    shapeDropdown.appendChild(option);
    shapeDropdown.selectedIndex = shapeDropdown.options.length - 1;
    document.getElementById('shape-dropdown')?.dispatchEvent(new Event('change'));
  }

  function updatePointDropdown(objId: number) {
    while (pointDropdown.options.length > 0) pointDropdown.options.remove(0);
    const points = objects[objId].positions;
    points.map((point, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      colorValue.textContent = rgbToHex(point.getColor());
      colorPicker.value = rgbToHex(point.getColor());
      option.text = `Point-${index + 1}`;
      pointDropdown.appendChild(option);
    });
  }

  const lineBtn = document.getElementById('line-btn') as HTMLButtonElement;
  const squareBtn = document.getElementById('square-btn') as HTMLButtonElement;
  const rectangleBtn = document.getElementById('rectangle-btn') as HTMLButtonElement;
  const polygonBtn = document.getElementById('polygon-btn') as HTMLButtonElement;

  document.querySelector('#line-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.LINE;
    lineBtn.classList.remove('bg-blue-950', 'text-white');
    lineBtn.classList.add('text-blue-950', 'bg-white');

    squareBtn.classList.remove('bg-white', 'text-blue-950');
    rectangleBtn.classList.remove('bg-white', 'text-blue-950');
    polygonBtn.classList.remove('bg-white', 'text-blue-950');
  });

  document.querySelector('#square-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.SQUARE;
    squareBtn.classList.remove('bg-blue-950', 'text-white');
    squareBtn.classList.add('text-blue-950', 'bg-white');

    lineBtn.classList.remove('bg-white', 'text-blue-950');
    rectangleBtn.classList.remove('bg-white', 'text-blue-950');
    polygonBtn.classList.remove('bg-white', 'text-blue-950');
  });

  document.querySelector('#rectangle-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.RECTANGLE;
    rectangleBtn.classList.remove('bg-blue-950', 'text-white');
    rectangleBtn.classList.add('text-blue-950', 'bg-white');

    lineBtn.classList.remove('bg-white', 'text-blue-950');
    squareBtn.classList.remove('bg-white', 'text-blue-950');
    polygonBtn.classList.remove('bg-white', 'text-blue-950');
  });

  document.querySelector('#polygon-btn')?.addEventListener('click', () => {
    activeShape = ShapeType.POLYGON;
    polygonBtn.classList.remove('bg-blue-950', 'text-white');
    polygonBtn.classList.add('text-blue-950', 'bg-white');

    lineBtn.classList.remove('bg-white', 'text-blue-950');
    squareBtn.classList.remove('bg-white', 'text-blue-950');
    rectangleBtn.classList.remove('bg-white', 'text-blue-950');
  });

  document.querySelector('#save-btn')?.addEventListener('click', function () {
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
    objects = [];
    shapeDropdown.innerHTML = '';
    pointDropdown.innerHTML = '';
    renderCanvas();
    loadFile().then(shapes => {
      objects = shapes;
      renderCanvas();
      for (let object of objects) {
        updateShapeDropdown(object.shapeType);
        updatePointDropdown(object.id);
      }
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      fileInput.value = '';
    });
  });

  const stopDrawingButton = document.querySelector('#stop-drawing-btn')!!;
  stopDrawingButton.addEventListener('click', () => {
    isDrawing = false;
    stopDrawingButton.classList.add('hidden');
  });

  canvas.addEventListener('mousedown', e => {
    const x = e.offsetX;
    const y = canvas.height - e.offsetY;
    const point = new Point(x, y);

    switch (activeShape) {
      case ShapeType.LINE:
        if (!isDrawing) {
          const line = new Line(objects.length, point);
          objects.push(line);
          updateShapeDropdown('Line');
          updatePointDropdown(line.id);
          isDrawing = true;
        } else {
          const line = objects[objects.length - 1] as Line;
          line.setEndPoint(point);
          sliderLength.value = line.length.toString();
          sliderLengthValue.textContent = line.length.toString();
          updatePointDropdown(line.id);
          line.render(gl, bufferPos, bufferCol);
          renderCanvas();
          isDrawing = false;
        }
        break;
      case ShapeType.SQUARE:
        if (!isDrawing) {
          const square = new Square(objects.length, point);
          objects.push(square);
          updateShapeDropdown('Square');
          updatePointDropdown(square.id);
          isDrawing = true;
        } else {
          const square = objects[objects.length - 1] as Square;
          square.updatePoint(point);
          sliderLength.value = square.length.toString();
          sliderLengthValue.textContent = square.length.toString();
          updatePointDropdown(square.id);
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
          updateShapeDropdown('Rectangle');
          updatePointDropdown(rectangle.id);
          isDrawing = true;
        } else {
          const rectangle = objects[objects.length - 1] as Rectangle;
          rectangle.secondRef = point;
          rectangle.arrangePositions();
          rectangle.render(gl, bufferPos, bufferCol);
          updatePointDropdown(rectangle.id);
          renderCanvas();
          isDrawing = false;
          rectangle.setupWidthLength();
        }
        break;
      case ShapeType.POLYGON:
        if (!isDrawing) {
          const polygon = new Polygon(objects.length, []);
          polygon.positions.push(point);
          polygon.arrangePositions();
          objects.push(polygon);
          updateShapeDropdown('Polygon');
          updatePointDropdown(polygon.id);
          isDrawing = true; 
          stopDrawingButton.classList.remove('hidden');
        } else {
          const polygon = objects[objects.length - 1] as Polygon;
          polygon.positions.push(point);
          polygon.arrangePositions();
          updatePointDropdown(polygon.id);
          polygon.render(gl, bufferPos, bufferCol);
          renderCanvas();
        }
        break;
    }
  });

  canvas.addEventListener('mousemove', e => {
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

  const sideBar = document.getElementById('sidebar') as HTMLDivElement;
  const sliderContainer = document.getElementById('slider-container') as HTMLDivElement;
  const sliderX = document.getElementById('slider-x') as HTMLInputElement;
  const sliderY = document.getElementById('slider-y') as HTMLInputElement;
  const sliderLength = document.getElementById('slider-length') as HTMLInputElement;
  const sliderRotation = document.getElementById('slider-rotation') as HTMLInputElement;
  const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
  const shapeDropdown = document.getElementById('shape-dropdown') as HTMLSelectElement;
  const pointDropdown = document.getElementById('point-dropdown') as HTMLSelectElement;

  const colorValue = document.getElementById('color-picker-value') as HTMLSpanElement;
  const sliderXValue = document.getElementById('slider-x-value') as HTMLSpanElement;
  const sliderYValue = document.getElementById('slider-y-value') as HTMLSpanElement;
  const sliderLengthValue = document.getElementById('slider-length-value') as HTMLSpanElement;
  const sliderRotationValue = document.getElementById('slider-rotation-value') as HTMLSpanElement;

  const sliderPoint = document.getElementById('slider-point') as HTMLInputElement;
  const sliderPointValue = document.getElementById('slider-point-value') as HTMLSpanElement;
  const sliderPointLabel = document.getElementById('slider-point-label') as HTMLLabelElement;

  const sliderXPoint = document.getElementById('slider-x-point') as HTMLInputElement;
  const sliderXPointValue = document.getElementById('slider-x-point-value') as HTMLSpanElement;
  const sliderXPointLabel = document.getElementById('slider-x-point-label') as HTMLLabelElement;
  const sliderYPoint = document.getElementById('slider-y-point') as HTMLInputElement;
  const sliderYPointValue = document.getElementById('slider-y-point-value') as HTMLSpanElement;
  const sliderYPointLabel = document.getElementById('slider-y-point-label') as HTMLLabelElement;

  // Event listener for dropdown selection changes
  document.getElementById('shape-dropdown')?.addEventListener('change', function () {
    selectedShapeIndex = parseInt((this as HTMLSelectElement).value, 10);
    updatePointDropdown(selectedShapeIndex);
    sideBar.style.display = 'block';
    sliderX.value = '0';
    sliderY.value = '0';
    sliderLength.value = '0';
    sliderRotation.value = '0';

    sliderPoint.value = '0';

    const canvasWidth = Math.floor((canvas?.width || 0) / 2);
    const canvasHeight = Math.floor((canvas?.height || 0) / 2);
    sliderX.setAttribute('min', (canvasWidth * -1).toString());
    sliderX.setAttribute('max', canvasWidth.toString());
    sliderY.setAttribute('min', (canvasHeight * -1).toString());
    sliderY.setAttribute('max', canvasHeight.toString());

    sliderLength.setAttribute('min', '1');
    sliderLength.setAttribute('max', canvasWidth.toString());

    if (objects[selectedShapeIndex].shapeType == ShapeType.SQUARE) {
      const square = objects[selectedShapeIndex] as Square;
      sliderLength.value = square.length.toString();
      sliderLengthValue.textContent = square.length.toString();
    } else if (objects[selectedShapeIndex].shapeType == ShapeType.LINE) {
      const line = objects[selectedShapeIndex] as Line;
      sliderLength.value = line.length.toString();
      sliderLengthValue.textContent = line.length.toString();
    } else {
      sliderLengthValue.textContent = '0';
    }

    const sliderz = document.getElementById('slider-width-container') as HTMLDivElement;
    if (objects[selectedShapeIndex].shapeType == ShapeType.RECTANGLE) {
      sliderz.innerHTML = `
          <label for="slider-width">Width: <span id="slider-width-value">0</span></label>
          <input id="slider-width" type="range" min="1" max="${canvas.width}" step="1" value="0" />
      `;
    } else {
      sliderz.innerHTML = ""
    }



    document.addEventListener("input", (e) => {
      if (e.target === document.getElementById('slider-width') && objects[selectedShapeIndex!!].shapeType === ShapeType.RECTANGLE) {
        const sliderWidth = e.target as HTMLInputElement;
        (document.getElementById("slider-width-value") as HTMLSpanElement).textContent = sliderWidth.value;
        const newWidth = parseFloat((e.target as HTMLInputElement).value);
        const selectedShape = objects[selectedShapeIndex!!];
        const rectangle = selectedShape as Rectangle;
        rectangle.setWidth(newWidth);
        scale(rectangle, rectangle.sx, rectangle.sy);
        renderCanvas(); 
      }
      if (e.target === document.getElementById('slider-length') && objects[selectedShapeIndex!!].shapeType === ShapeType.RECTANGLE) {
        const sliderLength = e.target as HTMLInputElement;
        (document.getElementById("slider-length-value") as HTMLSpanElement).textContent = sliderLength.value;
        const newLength = parseFloat((e.target as HTMLInputElement).value);
        const selectedShape = objects[selectedShapeIndex!!];
        const rectangle = selectedShape as Rectangle;
        rectangle.setLength(newLength);
        scale(rectangle, rectangle.sx, rectangle.sy);
        renderCanvas(); 
      }
    });

    if (objects[selectedShapeIndex].shapeType === ShapeType.POLYGON) {
      // Update HTML for Polygon-specific sliders
      sliderContainer.innerHTML = `
          <label for="slider-x-point">Single point translation X: <span id="slider-x-point-value">0</span></label>
          <input id="slider-x-point" type="range" min="0" max="${canvas.width}" step="1" value="0" />
          <label for="slider-y-point">Single point translation Y: <span id="slider-y-point-value">0</span></label>
          <input id="slider-y-point" type="range" min="0" max="${canvas.height}" step="1" value="0" />
      `;

      const sliderXPoint = document.getElementById('slider-x-point') as HTMLInputElement;
      const sliderXPointValue = document.getElementById('slider-x-point-value') as HTMLSpanElement;
      const sliderYPoint = document.getElementById('slider-y-point') as HTMLInputElement;
      const sliderYPointValue = document.getElementById('slider-y-point-value') as HTMLSpanElement;

      sliderXPoint.setAttribute('min', (canvasWidth * -1).toString());
      sliderXPoint.setAttribute('max', canvasWidth.toString());
      sliderYPoint.setAttribute('min', (canvasHeight * -1).toString());
      sliderYPoint.setAttribute('max', canvasHeight.toString());
      sliderXPointValue.textContent = '0';
      sliderYPointValue.textContent = '0';
    } else {
      // Default HTML for non-Polygon shapes
      sliderContainer.innerHTML = `
      <label for="slider-point">Single point slider: <span id="slider-point-value">0</span></label>
      <input id="slider-point" type="range" min="0" max="${canvas.width}" step="1" value="0" />
      `;
      sliderPoint.setAttribute('min', '0');
      sliderPoint.setAttribute('max', '100');
      sliderPointValue.textContent = '0';
    }

    // Update slider value displays
    sliderXValue.textContent = '0';
    sliderYValue.textContent = '0';
    
    sliderRotationValue.textContent = '0';
  });

  // Event listener for dropdown selection point
  document.getElementById('point-dropdown')?.addEventListener('change', function () {
    selectedPointIndex = parseInt((this as HTMLSelectElement).value, 10);
    selectedShapeIndex = parseInt((document.getElementById('shape-dropdown') as HTMLSelectElement).value, 10);
    const color = rgbToHex(objects[selectedShapeIndex].getPoints()[selectedPointIndex].getColor());
    colorPicker.value = color;
    colorValue.textContent = color;
  });

  colorPicker.addEventListener('change', function (e) {
    selectedPointIndex = parseInt((document.getElementById('point-dropdown') as HTMLSelectElement).value, 10);
    selectedShapeIndex = parseInt((document.getElementById('shape-dropdown') as HTMLSelectElement).value, 10);
    const hex = (e.target as HTMLInputElement).value;
    colorValue.textContent = hex;
    colorPicker.value = hex;
    objects[selectedShapeIndex].getPoints()[selectedPointIndex].setColor(hexToRgb(hex));
    renderCanvas();
  });

  
  // Slider
  sliderX.addEventListener('input', function (e) {
    sliderXValue.textContent = this.value;
    const newX = parseFloat((e.target as HTMLInputElement).value);

    if (selectedShapeIndex !== null) {
      const selectedShape = objects[selectedShapeIndex];
      translate(selectedShape, newX, selectedShape.ty);
      renderCanvas();
    }
  });
  sliderY.addEventListener('input', function (e) {
    sliderYValue.textContent = this.value;
    const newY = parseFloat((e.target as HTMLInputElement).value);
    if (selectedShapeIndex !== null) {
      const selectedShape = objects[selectedShapeIndex];
      translate(selectedShape, selectedShape.tx, newY);
      renderCanvas();
    }
  });


  document.addEventListener('input', (e) => {
    if ((e.target as HTMLInputElement).id == "slider-point") {
      const sliderPoint = e.target as HTMLInputElement;
      sliderPointValue.textContent = sliderPoint.value;
      const lengthDif = parseFloat((e.target as HTMLInputElement).value);
      selectedPointIndex = parseInt((document.getElementById('point-dropdown') as HTMLSelectElement).value, 10);
  
      if (selectedShapeIndex !== null && selectedPointIndex !== null) {
        if (objects[selectedShapeIndex].shapeType == ShapeType.SQUARE) {
          const square = objects[selectedShapeIndex] as Square;
          square.movePoint(lengthDif, selectedPointIndex)
        } else if (objects[selectedShapeIndex].shapeType == ShapeType.LINE) {
          const line = objects[selectedShapeIndex] as Line;
          line.movePoint(lengthDif, selectedPointIndex)
        } else if (objects[selectedShapeIndex].shapeType == ShapeType.RECTANGLE) {
          const rectangle = objects[selectedShapeIndex] as Rectangle;
          const rate = lengthDif > 0 ? lengthDif : 1
          rectangle.setLength(rate)
          rectangle.setWidth(rate)
          scale(rectangle, rate, rate)
        }
        renderCanvas()
      }
  
    }
  });


  function getSelectedPoint() {
    const polygon = objects[selectedShapeIndex!!] as Polygon;
    const dropdown = document.getElementById('point-dropdown') as HTMLSelectElement;
    const pointIndex = parseInt(dropdown.options[dropdown.selectedIndex].value, 10);
    const selectedPoint = polygon.getPoints()[pointIndex];
          
    return new Point(selectedPoint.x, selectedPoint.y);
  }

  var sptPointRef: Point;
  var sptPointXOld: number;
  var sptPointYOld: number;
  var spt = true;
  const sptButton = document.getElementById('spt-btn') as HTMLButtonElement
  sptButton.addEventListener('click', (e) => {
    sptButton.classList.toggle('bg-white')
    sptButton.classList.toggle('text-blue-950')
    const selectedPoint = getSelectedPoint();
    sptPointXOld = selectedPoint.x
    sptPointYOld = selectedPoint.y
    const selectedShape = objects[selectedShapeIndex!!];  
    sptPointRef = selectedShape.getPointRef(selectedPoint.x, selectedPoint.y)!!;

    // spt = !spt 
    // sptPointRef = objects[selectedShapeIndex!!].positions 
  })

  document.addEventListener('input', (e) => {
    if ((e.target as HTMLInputElement).id == "slider-x-point") {
      const sliderXPoint = e.target as HTMLInputElement;
      (document.getElementById("slider-x-point-value") as HTMLSpanElement).textContent = sliderXPoint.value;
      if (!spt) return 
      if (selectedShapeIndex == null) return 
  
      const xDif = parseFloat((e.target as HTMLInputElement).value);
      const selectedShape = objects[selectedShapeIndex!!];  
      const pointWrapper = new Wrapper(sptPointRef)
  
      if (selectedShape instanceof Rectangle) {
        pointWrapper.obj = new Point(sptPointXOld, sptPointYOld)
      }
       
      (selectedShape as Polygon).singlePointTranslate(pointWrapper, sptPointXOld + xDif, sptPointYOld)
      
      renderCanvas();
  
    }
  })

  document.addEventListener('input', (e) => {
    if ((e.target as HTMLInputElement).id == "slider-x-point") {
      const sliderXPoint = e.target as HTMLInputElement;
      (document.getElementById("slider-x-point-value") as HTMLSpanElement).textContent = sliderXPoint.value;
      if (!spt) return 
      if (selectedShapeIndex == null) return 
  
      const xDif = parseFloat((e.target as HTMLInputElement).value);
      const selectedShape = objects[selectedShapeIndex!!];  
      const pointWrapper = new Wrapper(sptPointRef)
  
      if (selectedShape instanceof Rectangle) {
        pointWrapper.obj = new Point(sptPointXOld, sptPointYOld)
      }
       
      (selectedShape as Polygon).singlePointTranslate(pointWrapper, sptPointXOld + xDif, sptPointYOld)
      
      renderCanvas();
    }

    if ((e.target as HTMLInputElement).id == "slider-y-point") {
      const sliderXPoint = e.target as HTMLInputElement;
      (document.getElementById("slider-y-point-value") as HTMLSpanElement).textContent = sliderXPoint.value;
      if (!spt) return 
      if (selectedShapeIndex == null) return 
  
      const yDif = parseFloat((e.target as HTMLInputElement).value);
      const selectedShape = objects[selectedShapeIndex!!];  
      const pointWrapper = new Wrapper(sptPointRef)
  
      if (selectedShape instanceof Rectangle) {
        pointWrapper.obj = new Point(sptPointXOld, sptPointYOld)
      }
       
      (selectedShape as Polygon).singlePointTranslate(pointWrapper, sptPointXOld, sptPointYOld + yDif)
      
      renderCanvas();
    }
  })






  sliderLength.addEventListener('input', function (e) {
    sliderLengthValue.textContent = this.value;
    const newLength = parseFloat((e.target as HTMLInputElement).value);

    if (selectedShapeIndex !== null) {
      if (objects[selectedShapeIndex].shapeType == ShapeType.SQUARE) {
        const square = objects[selectedShapeIndex] as Square;
        square.updateLength(newLength);
      } else if (objects[selectedShapeIndex].shapeType == ShapeType.LINE) {
        const line = objects[selectedShapeIndex] as Line;
        line.updateLength(newLength);
        scale(line, line.sx, line.sy);
      }
      renderCanvas();
    }
  });

  sliderRotation.addEventListener('input', function (e) {
    sliderRotationValue.textContent = this.value;
    const angle = (e.target as HTMLInputElement).valueAsNumber;
    if (selectedShapeIndex !== null) {
      const selectedShape = objects[selectedShapeIndex];
      rotate(selectedShape, angle);
      renderCanvas();
    }
  });

  const deletePointButton = document.getElementById('delete-point-btn') as HTMLButtonElement;
  deletePointButton.addEventListener('click', () => {
    if (selectedShapeIndex !== null && objects[selectedShapeIndex!!].shapeType === ShapeType.POLYGON) {
      const polygon = objects[selectedShapeIndex!!] as Polygon;
      const dropdown = document.getElementById('point-dropdown') as HTMLSelectElement;
      const pointIndex = parseInt(dropdown.options[dropdown.selectedIndex].value, 10);
      const selectedPoint = polygon.getPoints()[pointIndex];
      console.log(selectedPoint)

      polygon.deletePoint(selectedPoint);
      renderCanvas();
      updatePointDropdown(selectedShapeIndex!!);
    } else {
      alert('Only polygon point can be deleted!');
    }
  });
  let animateFlag = false;
  let lastTime = 0;
    const anglePerSecond = 30; 

    function animate(time: number): void {
      if (!animateFlag) {
        return; // stop animation
      }
      if (!lastTime) {
        lastTime = time;
      }

      const deltaTime = (time - lastTime) / 1000;
      const angle = anglePerSecond * deltaTime;

      if (selectedShapeIndex != null) {
        const selectedShape = objects[selectedShapeIndex];
        animateRotation(selectedShape, angle);
      }

      renderCanvas();
      lastTime = time; 
      requestAnimationFrame(animate);
    }

    // Start the animation loop
    requestAnimationFrame(animate);
  
  document.getElementById('animation-btn')?.addEventListener('click', () => {
    if (!animateFlag) {
      animateFlag = true;
      requestAnimationFrame(animate);
  }
  })

  document.getElementById('stop-animation-btn')?.addEventListener('click', () => { 
    animateFlag = false;
  });
}

main();
