import { VirtualNode, ElementNode, Materialized } from "./types";

export const reqFrame =
  window.requestAnimationFrame ||
  // @ts-ignore
  window.webkitRequestAnimationFrame ||
  // @ts-ignore
  window.mozRequestAnimationFrame ||
  // @ts-ignore
  window.oRequestAnimationFrame ||
  // @ts-ignore
  window.msRequestAnimationFrame ||
  // @ts-ignore
  function (callback, element) {
    setTimeout(callback, 1000 / 60);
  };

export function replaceChildren(node: Element, ...children: Materialized[]) {
  if (!node) throw new Error("Cannot replace children of " + node);
  const e = node as any;
  if (!(e instanceof Element))
    throw new Error(
      "Cannot replace children of class " +
        (e.constructor?.name ?? e.toString())
    );
  if (!e.replaceChildren) {
    e.innerHTML = "";
    e.append(...children);
    return;
  }
  e.replaceChildren(...children);
}

export function isStringable(t: any) {
  switch (typeof t) {
    case "string":
    case "number":
    case "boolean":
      return true;
    default:
      return false;
  }
}

export function deepEqual(o1: any, o2: any) {
  if (o1 === o2) {
    // if it is the same reference (or the same value if both primitives)
    return true;
  } else if (
    o1 === undefined ||
    o1 === null ||
    o2 === undefined ||
    o2 === undefined
  ) {
    // Test if undefined to prevent any crash further on
    return false;
  } else if (o1.constructor.name !== o2.constructor.name) {
    // if the constructor (work for primitives too) is different they can't be the same objects
    return false;
  } else if (typeof o1 === "function") {
    // function should be stringified to get a real comparision
    return o1.toString() === o2.toString();
  } else if (typeof o1 !== "object") {
    // if they have the same constructor but are not object they're just primitives with different values
    return false;
  } else {
    // they're not primitives and they've the same constructor so we check properties
    const o1Keys = Object.keys(o1);
    const o2Keys = Object.keys(o2);
    if (o1Keys.length !== o2Keys.length) {
      // if not the same number of properties it's different
      return false;
    } else {
      // Properties are uniques and the two objects have the same number of properties so we can run accross only one properties list

      // First check if they all exists within the two lists
      for (const property of o1Keys) {
        const i = o2Keys.findIndex((key) => key === property);
        if (i === -1) {
          return false;
        } else {
          o2Keys.splice(i, 1);
        }
      }
      // If still there, just run the function recursively
      for (const property of o1Keys) {
        if (!deepEqual(o1[property], o2[property])) {
          return false;
        }
      }
      // There's still the possibility of having objects with not enumerable property  like Map
      // I SHALL TREAT THEM HERE
    }
  }
  return true;
}

export function runTree(
  node: VirtualNode,
  pathList: string[],
  callback: (node: VirtualNode, pathList: string[]) => VirtualNode
) {
  if (typeof node !== "object") {
    return node;
  }
  let element: ElementNode = { ...node };

  let index = pathList.findIndex(function (path: string) {
    return path === element.path;
  });
  if (index !== -1) {
    let node = callback(element, pathList);
    pathList.splice(index, 1);
    return node;
  }

  let isAncestor = !!pathList.find(function (path: string) {
    return path.startsWith(element.path);
  });
  if (isAncestor) {
    element.children = element.children.map(function (child: VirtualNode) {
      return runTree(child, pathList, callback);
    });
  }

  return element;
}
