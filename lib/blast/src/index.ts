import {
  reqFrame,
  isStringable,
  deepEqual,
  replaceChildren /*runTree*/
} from "./utils";
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
  BlastEffect
} from "./types";

function parseStyleString(style: string): { [key: string]: string } {
  return Object.fromEntries(style.split(";").map((a) => a.split(":")));
}
function virtualize(
  component: string | BlastComponent,
  attrs: Attributes = {},
  ...childNode: VirtualNode[]
): ElementNode {
  let key = "";
  let props: { [key: string]: any } = {};
  for (const property in attrs) {
    if (attrs[property] === undefined) continue;
    else if (property === key) {
      key = attrs.key!;
    } else if (property.startsWith("c:")) {
      if (!attrs[property]) continue;
      const cla = property.slice(2).split(":").join(" ");
      if (!props.className) props.className = cla;
      else props.className += " " + cla;
    } else if (property === "className") {
      if (!props.className) props.className = attrs.className;
      else props.className += " " + attrs.className;
    } else if (property.startsWith("_")) {
      if (typeof props.style === "string") {
        props.style = parseStyleString(props.style);
      }
      props.style ??= {};
      props.style[property.slice(1)] = attrs[property];
    } else if (property === "style") {
      if (typeof props.style === "object") {
        const parsed: { [key: string]: any } =
          typeof attrs.style === "object"
            ? attrs.style
            : parseStyleString(attrs.style as string);
        props.style ??= {};
        for (const prop in parsed) {
          props.style[prop] ??= parsed[prop];
        }
      } else props.style = attrs.style;
    } else {
      props[property] = attrs[property];
    }
  }
  let children = childNode.flat(Infinity);

  if (typeof component === "function") {
    props.children = children;
    children = [];
  }

  return {
    component,
    path: "",
    children,
    props,
    key
  };
}
const needUnit: { [key: string]: string } = {
  width: "px",
  height: "px",
  margin: "px",
  "margin-left": "px",
  "margin-right": "px",
  "margin-top": "px",
  "margin-bottom": "px",
  "margin-inline": "px",
  "margin-block": "px",
  "margin-inline-start": "px",
  "margin-block-start": "px",
  "margin-inline-end": "px",
  "margin-block-end": "px",
  padding: "px",
  "padding-left": "px",
  "padding-right": "px",
  "padding-top": "px",
  "padding-bottom": "px",
  "padding-inline": "px",
  "padding-block": "px",
  "padding-inline-start": "px",
  "padding-block-start": "px",
  "padding-inline-end": "px",
  "padding-block-end": "px",
  gap: "px",
  "column-gap": "px",
  "row-gap": "px",
  "border-radius": "px"
  // ...
};
function transformCSSProperty(property: string) {
  let transformed = "";
  let copy = property.split("");
  let i = copy.findIndex((a) => /[A-Z]/.test(a));
  while (i !== -1) {
    transformed += copy.slice(0, i).join("");
    transformed += "-" + copy[i].toLowerCase();
    copy = copy.slice(i + 1);
    i = copy.findIndex((a) => a === a.toUpperCase());
  }
  return transformed + copy.join("");
}
function transformCSSValue(property: string, value: any) {
  return property in needUnit && typeof value !== "string"
    ? value + needUnit[property]
    : value;
}
function serialize(node: VirtualNode): string {
  if (["string", "number", "boolean"].includes(typeof node)) {
    return node.toString();
  }
  const element = node as ElementNode;
  const tag =
    typeof element.component !== "string"
      ? element.component.name
      : element.component;
  return `<${tag} ${Object.entries(element.props)
    .map(([a, b]) => {
      let x = transformCSSProperty(a);
      return `${x}="${transformCSSValue(a, b)}"`;
    })
    .join(" ")}>${element.children?.map((c) => serialize(c))}</${tag}>`;
}

function materialize(node: VirtualNode): Materialized[] {
  if (typeof node !== "object") {
    return [node.toString()];
  }
  const children: Materialized[] = [];

  if (node.component === "svg") {
    node.props.html = node.children.map(serialize).join("");
  } else {
    children.push(
      ...(node.children
        .map((child) => materialize(child))
        .flat(Infinity) as Materialized[])
    );
  }
  if (typeof node.component === "function") {
    return children;
  }
  const elem =
    node.component == "svg"
      ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
      : document.createElement(node.component);
  elem.append(...children);
  for (const attribute in node.props) {
    if (attribute === "ref" && node.props.ref instanceof BlastRef) {
      node.props.ref.current = elem;
    } else if (attribute === "html") {
      elem.innerHTML = serialize(node.props[attribute]);
    } else if (attribute === "style" && typeof node.props.style === "object") {
      if (node.component === "svg") continue;
      const styles = node.props.style as { [key: string]: string };
      for (const property in styles) {
        const value = styles[property as keyof typeof styles];
        if (property.startsWith("--")) {
          (elem as HTMLElement).style.setProperty(property, value);
        } else {
          const prop = transformCSSProperty(property);
          (elem as HTMLElement).style.setProperty(
            prop,
            transformCSSValue(prop, value)
          );
        }
      }
    } else if (attribute === "intl") {
      node.props.intl!.forEach((f) => f(elem));
    } else if (attribute === "className") {
      const className = Array.isArray(node.props[attribute])
        ? node.props[attribute].filter(Boolean).join(" ")
        : node.props[attribute];
      elem.setAttribute("class", className);
    } else if (attribute.startsWith("on")) {
      // @ts-ignore
      elem[attribute.toLowerCase()] = node.props[attribute];
    } else {
      elem.setAttribute(attribute, node.props[attribute]);
    }
  }
  elem.setAttribute("data-blast-path", node.path);
  return [elem];
}

function Blast(this: BlastInstance) {
  // let count = 0;
  let oldStates: BlastState = {};
  const states: BlastState = {};
  // let tempStates: BlastState = {};
  let vDOM: VirtualNode = defaultElementNode;
  let vApp: ElementNode = defaultElementNode;
  let root: HTMLElement;
  // let pathToUpdate: string[] = [];
  let effects: BlastPendingEffect[] = [];
  let waitingForFrames: Promise<void> | false = false;

  function mergeStates(to: BlastState) {
    for (const path in states) {
      to[path] = [...states[path]];
    }
  }
  function cleanEffects() {
    while (effects[0]) {
      effects.shift()!();
    }
  }

  // function render(rootNode: VirtualNode) {
  //   return defaultElementNode;
  // }

  /** Temporary Update Function */
  function update(path: string): Promise<void> {
    // pathToUpdate.push(path);
    if (waitingForFrames !== false) return waitingForFrames;
    waitingForFrames = new Promise((resolve) => {
      reqFrame(() => {
        vDOM = render(vApp);
        mergeStates(oldStates);
        const materialized = materialize(vDOM);
        // @ts-ignore
        replaceChildren(root, ...materialized);
        cleanEffects();
        resolve();
      });
    });
    waitingForFrames.then(() => {
      waitingForFrames = false;
    });
    return waitingForFrames;
  }

  /** Temporary Render Function */
  function render(rootNode: VirtualNode, path = ".") {
    if (typeof rootNode !== "object") return rootNode;
    const vElem = rootNode;
    vElem.path = path;
    if (typeof vElem.component === "function") {
      const fresh = !states[path];
      states[path] ||= [];
      vElem.children = [
        vElem.component(vElem.props, {
          index: 0,
          hookValues: states[path],
          fresh,
          pushEffects: (n: number, effect: BlastEffect, dependencies: any) => {
            if (
              !Object.prototype.hasOwnProperty.call(states[path][n], "deps") ||
              !deepEqual(states[path][n].deps, dependencies)
            ) {
              effects.push(() => {
                typeof states[path][n].ext === "function" &&
                  states[path][n].ext();
                states[path][n].ext = effect(states[path][n].deps);
                states[path][n].deps = dependencies;
              });
            }
          },
          update: (index: number, newValue: any) => {
            states[path][index] = newValue;
            return update(path);
          }
        })
      ].flat(Infinity) as VirtualNode[];
    }

    for (let i = 0; i < vElem.children.length; i++) {
      if (typeof vElem.children[i] === "object") {
        vElem.children[i] = render(
          vElem.children[i],
          `${path}.${
            typeof vElem.component === "string" ? vElem.component : "C"
          }:${i}`
        );
      } else if (!isStringable(vElem.children[i])) {
        vElem.children.splice(i, 1);
        i--;
      }
    }
    return vElem;
  }
  this.mount = function (app: BlastComponent, selector: string | HTMLElement) {
    vApp = virtualize(app);
    vDOM = render(vApp);
    mergeStates(oldStates);
    if (typeof selector === "string") {
      root = document.querySelector(selector)! as HTMLElement;
    } else {
      root = selector;
    }
    const materialized = materialize(vDOM);
    replaceChildren(root, ...materialized);
    cleanEffects();
    return this;
  };
}

Blast.virtualize = virtualize;
Blast.materialize = materialize;
Blast.serialize = serialize;

export * from "./hooks";

export default Blast;
