import { Shape } from '../classes/shape.ts';
import { Point } from '../classes/point.ts';
import { Line } from '../classes/line.ts';
import { Square } from '../classes/square.ts';
import { Rectangle } from '../classes/rectangle.ts';
import { Polygon } from '../classes/polygon.ts';

export const loadFile = (): Promise<Shape[]> => {
  return new Promise((resolve, reject) => {
    let input: HTMLInputElement | null = document.querySelector('#file-input');

    if (!input || !input.files || input.files.length === 0) {
      reject('Please select a file.');
      return;
    }

    let file = input.files[0];
    if (file.type !== 'application/json') {
      reject('Please select a JSON file.');
      return;
    }

    let reader = new FileReader();
    reader.onload = function(event) {
      let data;
      if (!event.target) {
        reject('File loading error.');
        return;
      }

      let jsonData = event.target.result;

      try {
        if (typeof jsonData === 'string') {
          data = JSON.parse(jsonData);
          resolve(objectToShape(data));
        }
      } catch (error: any) {
        reject('Error parsing JSON: ' + error.message);
      }
    };
    reader.readAsText(file);
  });
};

interface ShapeObject {
  id: number;
  shapeType: string;
  positions: Point[];
  oriPositions?: Point[];
  "tx": number,
  "ty": number,
  "degree": number,
  "sx": number,
  "sy": number,
  diagonal?:number,
  length?: number,
  oriLength?: number,
  center?: Point;
  references?: Point[];
  secondRef?: Point | null;
  firstRef?: Point | null;
}

const objectToShape = (objects: ShapeObject[]): Shape[] => {
  console.log(objects);
  let shapes: Shape[] = [];
  for (const object of objects) {
    if (object.shapeType == 'Line') {
      let line = new Line(object.id, objectToPoint(object.positions[0]));
      line.positions = objectsToPoints(object.positions);
      line.length = object.length!
      line.oriLength = object.oriLength!;
      shapes.push(line);
    } else if (object.shapeType == 'Square') {
      let square = new Square(object.id, objectToPoint(object.center!));
      square.positions = objectsToPoints(object.positions);
      square.length = object.length!
      square.diagonal = object.diagonal!
      square.oriPositions = object.oriPositions!
      shapes.push(square);
    } else if (object.shapeType == 'Rectangle') {
      let rectangle = new Rectangle(object.id, objectsToPoints(object.positions));
      rectangle.firstRef = objectToPoint(object.firstRef!);
      rectangle.secondRef = objectToPoint(object.secondRef!);
      shapes.push(rectangle);
    } else {
      let polygon = new Polygon(object.id, objectsToPoints(object.positions));
      shapes.push(polygon);
    }
  }
  return shapes;
};

const objectToPoint = (object: Point) => {
  let point = new Point(object.x, object.y);
  point.color = {
    r: object.color.r,
    g: object.color.g,
    b: object.color.b,
    a: object.color.a,
  };
  return point;
};

const objectsToPoints = (objects: Point[]) => {
  let points = [];
  for (let object of objects) {
    points.push(objectToPoint(object));
  }
  return points;
};