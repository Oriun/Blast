export type Attributes = {
  [property: string]: any;
  key?: string;
  style?: object | string;
  intl?: Array<(element: HTMLElement) => void>;
};

export type Materialized = Node | string;
export type StringNode = string | number | boolean;

export type State = [];

export type BlastComponent = (props: object, $?: State) => VirtualNode;

export type ElementNode = {
  path: string;
  children: VirtualNode[];
  component: BlastComponent | string;
  props: Attributes;
  key: string;
};
export type VirtualNode = ElementNode | StringNode;

export type BlastEffect = (oldDependencies: any) => () => void;

export type BlastPendingEffect = () => void;

export type BlastComponentState = {
  index: number;
  hookValues: any[];
  fresh: boolean;
  pushEffects: (effect: BlastEffect, dependencies: any) => void;
  update: (index: number, newValue: any) => Promise<void>;
};

export type BlastState = {
  [path: string]: BlastComponentState;
};

export const BlastTunnelSymbol = Symbol();

export type BlastDispatch = (value: any) => void;

export type BlastTunnel = {
  update: BlastDispatch | null;
  value: any;
  [BlastTunnelSymbol]: boolean;
};

export type BlastInstance = {
  mount: (app: BlastComponent, selector: string | HTMLElement) => void;
};
