import { reqFrame, isStringable, deepEqual, runTree } from "utils.js";
import { BlastRef } from "./classes";
import { defaultElementNode } from "./defaultValues";
import {
  Attributes,
  BlastComponent,
  ElementNode,
  Materialized,
  VirtualNode,
  BlastPendingEffect,
  BlastState,
  BlastInstance,
} from "./types";

function virtualize(
  component: string | BlastComponent,
  attrs: Attributes = {},
  ...childNode: VirtualNode[]
): ElementNode {
  const { key = "" } = attrs;
  let props = { ...attrs };
  let children = childNode;

  if (typeof component === "function") {
    props.children = childNode.flat(Infinity);
    children = [];
  }

  return {
    component,
    path: "",
    children,
    props,
    key,
  };
}

function materialize(node: VirtualNode): Materialized[] {
  if (typeof node !== "object") {
    return [node.toString()];
  }
  const children = node.children
    .map(materialize)
    .flat(Infinity) as Materialized[];

  if (typeof node.component === "function") {
    return children;
  }
  const elem = document.createElement(node.component) as HTMLElement;

  for (const attribute in node.props) {
    if (attribute === "ref" && node.props.ref instanceof BlastRef) {
      node.props.ref.current = elem;
    } else if (attribute === "style" && typeof node.props.style === "object") {
      const style = Object.entries(node.props.style)
        .map(([property, value]) => `${property}: ${value}`)
        .join("; ");
      // @ts-ignore
      elem.style = style;
    } else if (attribute === "intl") {
      node.props.intl!.forEach((f) => f(elem));
    } else if (attribute.startsWith("on") || attribute === "className") {
      // @ts-ignore
      elem[attribute] = node.props[attribute];
    } else {
      elem.setAttribute(attribute, node.props[attribute]);
    }
  }
  elem.setAttribute("data-blast-path", node.path);
  elem.append(...children);
  return [elem];
}

function Blast(this: BlastInstance) {
  let count = 0;
  let oldStates: BlastState = {};
  const states: BlastState = {};
  let tempStates: BlastState = {};
  let vDOM: VirtualNode = defaultElementNode;
  let vApp: ElementNode = defaultElementNode;
  let root: HTMLElement;
  let pathToUpdate = [];
  let effects: BlastPendingEffect[] = [];
  let waitingForFrames = false;

  function mergeStates(to: BlastState) {
    for (const path in states) {
      to[path] = { ...states[path] };
    }
  }
  function cleanEffects() {
    while (effects[0]) {
      effects.shift()!();
    }
  }

  this.mount = function (app: BlastComponent, selector: string | HTMLElement) {
    vApp = virtualize(app);
    // vDOM = render(vApp);
    mergeStates(oldStates);
    if (typeof selector === "string") {
      root = document.querySelector(selector)!;
    } else {
      root = selector;
    }
    root.replaceChildren(...materialize(vDOM));
    cleanEffects();
  };
}

Blast.virtualize = virtualize;

export * from "./hooks";

export default Blast;
