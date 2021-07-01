import React, { CSSProperties, RefObject } from 'react';
import { defaults } from './defaults';
import cytoscape from 'cytoscape';
import { patch } from './patch';
import { Diff } from './diff';
import { Get, ToJson } from './json';


interface CytoscapeComponentProps {
  id?: string;
  cy?: (cy: cytoscape.Core) => void;
  style?: CSSProperties;
  elements: cytoscape.ElementDefinition[];
  layout?: cytoscape.LayoutOptions;
  stylesheet?: cytoscape.Stylesheet | cytoscape.Stylesheet[] | string;
  className?: string;
  zoom?: number;
  pan?: cytoscape.Position;
  minZoom?: number;
  maxZoom?: number;
  zoomingEnabled?: boolean;
  userZoomingEnabled?: boolean;
  boxSelectionEnabled?: boolean;
  autoungrabify?: boolean;
  autounselectify?: boolean;
  panningEnabled?: boolean;
  userPanningEnabled?: boolean;
  autolock?: boolean;
  get?: Get;
  toJson?: ToJson;
  diff?: Diff;
  forEach?: <T>(list: T[], iterator: (value: T, index: number, array: T[]) => void) => void;
  headless?: boolean;
  styleEnabled?: boolean;
  hideEdgesOnViewport?: boolean;
  textureOnViewport?: boolean;
  motionBlur?: boolean;
  motionBlurOpacity?: number;
  wheelSensitivity?: number;
  pixelRatio?: number | 'auto';
}

/**
 * The `CytoscapeComponent` is a React component that allows for the declarative creation
 * and modification of a Cytoscape instance, a graph visualisation.
 */
export default class CytoscapeComponent extends React.Component<CytoscapeComponentProps> {
  private readonly containerRef: RefObject<HTMLDivElement>;
  private displayName: string;
  private _cy: cytoscape.Core | null = null;

  static defaultProps = defaults;

  static normalizeElements(elements: {
    nodes: cytoscape.ElementDefinition[];
    edges: cytoscape.ElementDefinition[];
  }): cytoscape.ElementDefinition[] {
    let { nodes, edges } = elements;

    if (nodes == null) {
      nodes = [];
    }

    if (edges == null) {
      edges = [];
    }

    return nodes.concat(edges);
  }

  constructor(props: CytoscapeComponentProps) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    this.displayName = `CytoscapeComponent`;
  }

  componentDidMount(): void {
    const container = this.containerRef.current;

    const {
      headless,
      styleEnabled,
      hideEdgesOnViewport,
      textureOnViewport,
      motionBlur,
      motionBlurOpacity,
      wheelSensitivity,
      pixelRatio
    } = this.props;

    this._cy = cytoscape({
      container,
      headless,
      styleEnabled,
      hideEdgesOnViewport,
      textureOnViewport,
      motionBlur,
      motionBlurOpacity,
      wheelSensitivity,
      pixelRatio
    });
    this.updateCytoscape(null, this.props);
  }

  updateCytoscape(prevProps: CytoscapeComponentProps | null, newProps: CytoscapeComponentProps): void {
    const cy = this._cy;
    const { diff, toJson, get, forEach } = newProps;

    if (!cy || !diff || !toJson || !get || !forEach)
      return;

    patch(cy, prevProps, newProps, diff, toJson, get, forEach);

    if (newProps.cy != null && cy) {
      newProps.cy(cy);
    }
  }

  componentDidUpdate(prevProps: CytoscapeComponentProps): void {
    this.updateCytoscape(prevProps, this.props);
  }

  componentWillUnmount(): void {
    if (this._cy)
      this._cy.destroy();
  }

  render(): JSX.Element {
    const { id, className, style } = this.props;

    return React.createElement('div', {
      ref: this.containerRef,
      id,
      className,
      style
    });
  }
}
