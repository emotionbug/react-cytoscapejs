import { shallowObjDiff } from './diff';
import { forEach, get, toJson } from './json';

export const elements = [
  { data: { id: 'a', label: 'Example node A' } },
  { data: { id: 'b', label: 'Example node B' } },
  { data: { id: 'e', source: 'a', target: 'b' } }
];

export const stylesheet = [
  {
    selector: 'node',
    style: {
      label: 'data(label)'
    }
  }
];

export const zoom = 1;

export const pan = {
  x: 0,
  y: 0
};

export const defaults = {
  diff: shallowObjDiff,
  get,
  toJson,
  forEach,
  elements,
  stylesheet,
  zoom,
  pan
};
