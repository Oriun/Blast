export type Attributes = {
  [property: string]: any;
  key?: string;
  style?: object | string;
  intl?: Array<(element: Element) => void>;
};

export type Materialized = Node | string;

export type StringNode = string | number | boolean;

export type State = [];

export type BlastStoredState = any[]

export type BlastComponentState = {
  index: number;
  hookValues: BlastStoredState;
  fresh: boolean;
  pushEffects: (n: number, effect: BlastEffect, dependencies: any) => void;
  update: (index: number, newValue: any) => Promise<void>;
};

export type BlastComponent = (props: object, $?: BlastComponentState) => VirtualNode | VirtualNode[];

export type ElementNode = {
  path: string;
  children: VirtualNode[];
  component: BlastComponent | string;
  props: Attributes;
  key: string;
};
export type VirtualNode = ElementNode | StringNode;

export type BlastEffect = (oldDependencies: any) => any;

export type BlastMemo = (oldDependencies?: any) => () => any;

export type BlastPendingEffect = () => void;

export type BlastState = {
  [path: string]: BlastStoredState;
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
