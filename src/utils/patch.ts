import { ForEach, Get, get as atKey, ToJson } from './json';
import { Diff, shallowObjDiff } from './diff';
import cytoscape from 'cytoscape';

const isDiffAtKey = (json1: any, json2: any, diff: Diff, key: string) =>
  diff(atKey(json1, key), atKey(json2, key));

export const patch = (cy: cytoscape.Core, json1: any, json2: any, diff: Diff, toJson: ToJson, get: Get, forEach: ForEach<any>): void => {
  cy.batch(() => {
    // The shallow object diff() must defer to patchElements() as it must compare the
    // elements as an unordered set.  A custom diff(), with Immutable for example,
    // could just use an equality check (===).
    if (
      diff === shallowObjDiff ||
      isDiffAtKey(json1, json2, diff, 'elements')
    ) {
      patchElements(
        cy,
        atKey(json1, 'elements') as cytoscape.ElementDefinition[],
        atKey(json2, 'elements') as cytoscape.ElementDefinition[],
        toJson,
        get,
        forEach,
        diff
      );
    }

    if (isDiffAtKey(json1, json2, diff, 'stylesheet')) {
      patchStyle(
        cy,
        atKey(json1, 'stylesheet'),
        atKey(json2, 'stylesheet'),
        toJson
      );
    }

    [
      // simple keys that can be patched directly (key same as fn name)
      'zoom',
      'minZoom',
      'maxZoom',
      'zoomingEnabled',
      'userZoomingEnabled',
      'pan',
      'panningEnabled',
      'userPanningEnabled',
      'boxSelectionEnabled',
      'autoungrabify',
      'autolock',
      'autounselectify'
    ].forEach(key => {
      if (isDiffAtKey(json1, json2, diff, key)) {
        patchJson(cy, key, atKey(json1, key), atKey(json2, key), toJson);
      }
    });
  });

  if (isDiffAtKey(json1, json2, diff, 'layout')) {
    patchLayout(cy, atKey(json1, 'layout'), atKey(json2, 'layout'), toJson);
  }
};
const patchJson = (cy: cytoscape.Core, key: string, val1: any, val2: any, toJson: ToJson) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cy[key](toJson(val2));
};

const patchLayout = (cy: cytoscape.Core, layout1: unknown, layout2: Record<string, any>, toJson: ToJson) => {
  const layoutOpts = toJson(layout2) as cytoscape.LayoutOptions;

  if (layoutOpts != null) {
    cy.layout(layoutOpts).run();
  }
};

const patchStyle = (cy: cytoscape.Core, style1: unknown, style2: Record<string, any>, toJson: ToJson) => {
  const style = cy.style();

  if (style == null) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  style.fromJson(toJson(style2)).update();
};

const patchElements = (cy: cytoscape.Core, eles1: cytoscape.ElementDefinition[], eles2: cytoscape.ElementDefinition[], toJson: ToJson, get: Get, forEach: ForEach<any>, diff: Diff) => {
  const toAdd: cytoscape.ElementDefinition[] = [];
  const toRm = cy.collection();
  const toPatch: { ele1: cytoscape.ElementDefinition; ele2: cytoscape.ElementDefinition; }[] = [];
  const eles1Map: { [k: string]: cytoscape.ElementDefinition } = {};
  const eles2Map: { [k: string]: cytoscape.ElementDefinition } = {};
  const eles1HasId = (id: string) => eles1Map[id] != null;
  const eles2HasId = (id: string) => eles2Map[id] != null;
  const getEle1 = (id: string) => eles1Map[id];
  const getId = (ele: cytoscape.ElementDefinition) => get(get(ele, 'data'), 'id');

  forEach(eles2, ele2 => {
    const id = getId(ele2);

    eles2Map[id] = ele2;
  });

  if (eles1 != null) {
    forEach(eles1, ele1 => {
      const id = getId(ele1);

      eles1Map[id] = ele1;

      if (!eles2HasId(id)) {
        toRm.merge(cy.getElementById(id));
      }
    });
  }

  forEach(eles2, ele2 => {
    const id = getId(ele2);
    const ele1 = getEle1(id);

    if (eles1HasId(id)) {
      toPatch.push({ ele1, ele2 });
    } else {
      toAdd.push(toJson(ele2));
    }
  });

  if (toRm.length > 0) {
    cy.remove(toRm);
  }

  if (toAdd.length > 0) {
    cy.add(toAdd);
  }

  toPatch.forEach(({ ele1, ele2 }) =>
    patchElement(cy, ele1, ele2, toJson, get, diff)
  );
};

const patchElement = (cy: cytoscape.Core, ele1: cytoscape.ElementDefinition, ele2: cytoscape.ElementDefinition, toJson: ToJson, get: Get, diff: Diff) => {
  const id = get(get(ele2, 'data'), 'id');
  const cyEle = cy.getElementById(id);
  const patch: { [k: string]: unknown } = {};
  const jsonKeys = [
    'data',
    'position',
    'selected',
    'selectable',
    'locked',
    'grabbable',
    'classes'
  ];

  jsonKeys.forEach(key => {
    const data2 = get(ele2, key);

    if (diff(data2, get(ele1, key))) {
      patch[key] = toJson(data2);
    }
  });

  const scratch2 = get(ele2, 'scratch');
  if (diff(scratch2, get(ele1, 'scratch'))) {
    cyEle.scratch(toJson(scratch2));
  }

  if (Object.keys(patch).length > 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cyEle.json(patch);
  }
};
