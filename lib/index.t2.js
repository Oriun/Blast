let count = 0
let oldStates = {}
const states = {}
let tempStates = {}
let vDOM = {}
let vApp = null
let getRoot = null
let pathToUpdate = []
const effects = []
let waitingForFrames = false

const reqFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame

export function createContext (defaultValue) {
  const updateTunnel = {}
  updateTunnel[Symbol.for('BlastContext')] = true
  return updateTunnel
}

function mergeStates (to) {
  for (const path in states) {
    to[path] = [...states[path]]
  }
}

function deepEqual (o1, o2) {
  if (o1 === o2) { // if it is the same reference (or the same value if both primitives)
    return true
  } else if (o1 === undefined || o2 === undefined) { // Test if undefined to prevent any crash further on
    return false
  } else if (o1.constructor.name !== o2.constructor.name) { // if the constructor (work for primitives too) is different they can't be the same objects
    return false
  } else if (typeof o1 === 'function') { // function should be stringified to get a real comparision
    return o1.toString() === o2.toString()
  } else if (typeof o1 !== 'object') { // if they have the same constructor but are not object they're just primitives with different values
    return false
  } else { // they're not primitives and they've the same constructor so we check properties
    const o1Keys = Object.keys(o1)
    const o2Keys = Object.keys(o2)
    if (o1Keys.length !== o2Keys.length) { // if not the same number of properties it's different
      return false
    } else {
      // Properties are uniques and the two objects have the same number of properties so we can run accross only one properties list

      // First check if they all exists within the two lists
      for (const property of o1Keys) {
        const i = o2Keys.findIndex(key => key === property)
        if (i === -1) {
          return false
        } else {
          o2Keys.splice(i, 1)
        }
      }
      // If still there, just run the function recursively
      for (const property of o1Keys) {
        if (!deepEqual(o1[property], o2[property])) {
          return false
        }
      }
      // There's still the possibility of having objects with not enumerable property  like Map
      // I SHALL TREAT THEM HERE
    }
  }
  return true
}

export function virtualize (tagName, attrs = {}, ...children) {
  let key
  if (attrs?.key) {
    key = attrs.key
    delete attrs.key
  }
  if (typeof tagName === 'function') {
    return {
      b: { ...(attrs || {}), children },
      f: tagName,
      key
    }
  }
  return {
    t: tagName,
    a: attrs,
    c: children.flat(Infinity),
    key
  }
}

function materialize ({ t, c = [], a, p, f }) {
  if (f) {
    return c.map(materialize).flat(Infinity)
  }
  const ukey = count++
  const elem = document.createElement(t)
  for (const attr in a) {
    if (attr === 'ref' && Object.prototype.hasOwnProperty.call(a[attr], 'current')) {
      a[attr].current = elem
    } else if (attr === 'style' && typeof a[attr] === 'object') {
      const style = Object.entries(a.style).map(b => `${b[0]}: ${b[1]}`).join('; ')
      elem.style = style
    } else if (attr === 'intl' && a[attr] instanceof Array) {
      a[attr].forEach(f => f(elem))
    } else if (attr.startsWith('on') || attr === 'className') {
      elem[attr] = a[attr]
    } else {
      elem.setAttribute(attr, a[attr])
    }
  }
  // elem.setAttribute('data-blast-ukey', ukey)
  elem.setAttribute('data-blast-path', p)
  elem.append(...c.map(child => typeof child === 'object' ? materialize(child) : child).flat(Infinity))
  return [elem]
}

export function vShortcut (tag) {
  return function (attrs = {}, ...children) {
    return virtualize(tag, attrs, children)
  }
}

function vDiff (oldTree, newTree, rootElem) {
  console.log('vDiff', oldTree, newTree)
  if (!oldTree && newTree) {
    return () => {
      const parsed = newTree.p.split('.')
      const p = parsed.slice(0, -1).join('.')
      const element = document.querySelector(`[data-blast-path^="${p}"]`)
      const index = parseInt(parsed[parsed.length - 1].split(':')[1])
      window.alert('Don\'t forget to treat the case for when an element disappear in the vDiff function ;p')
    }
  } else if (oldTree && !newTree) {
    return () => {
      rootElem.remove()
    }
  } else if (typeof oldTree === 'string') {
    if (typeof newTree !== 'string') {
      return () => {
        rootElem.replaceWith(...materialize(newTree)) //3
      }
    } else if (oldTree !== newTree) {
      return () => {
        rootElem.textContent = newTree //4
      }
    } else {
      return () => {}//5
    }
  } else if (typeof newTree === 'string') {
    return () => {
      rootElem.replaceWith(newTree)//6
    }
  } else if (oldTree.key !== newTree.key) {
    return () => {
      rootElem.replaceWith(...materialize(newTree))//7
    }
  } else if (oldTree.t !== newTree.t || oldTree.f?.toString() !== newTree.f?.toString()) {
    return () => {
      rootElem.replaceWith(...materialize(newTree))//8
    }
  } else if (newTree.t && !deepEqual(oldTree.a, newTree.a)) {
    return () => {
      rootElem.replaceWith(...materialize(newTree))//9
    }
  } else if (newTree.f) {
    if (!deepEqual(oldTree.b, newTree.b) || !deepEqual(oldStates[oldTree.p], tempStates[newTree.p])) {
      return () => {
        rootElem.replaceWith(...materialize(newTree))//10
      }
    }
  }

  return () => console.log('nothing to do')
}

// document.querySelectorAll('[data-blast-path^="#.C:0.div:9"]')
function isStringable (t) {
  switch (typeof t) {
    case 'string':
    case 'number':
    case 'boolean':
      return true
    default: return false
  }
}

function render (root, path = '.') { // First render
  const vElem = root
  vElem.p = path
  if (vElem.f) {
    tempStates[path] = states[path] ||= []
    vElem.c = [vElem.f(vElem.b, { path, states: states[path], n: 0 })]
  }

  for (let i = 0; i < vElem.c.length; i++) {
    if (typeof vElem.c[i] === 'object') {
      vElem.c[i] = render(vElem.c[i], `${path}.${vElem.t || 'C'}:${i}`)
    } else if (!isStringable(vElem.c[i])) {
      vElem.c.splice(i, 1)
      i--
    }
  }
  return vElem
}

function render2 (root, path = '.', pathToVisit = []) {
  const vElem = root
  vElem.p = path
  if (vElem.f) {
    tempStates[path] ||= states[path] ||= []
    vElem.c = [vElem.f(vElem.b, { path, states: tempStates[path], n: 0 })]
  }

  for (let i = 0; i < vElem.c.length; i++) {
    if (typeof vElem.c[i] === 'object') {
      vElem.c[i] = render(vElem.c[i], `${path}.${vElem.t || 'C'}:${i}`, pathToVisit)
    } else if (!isStringable(vElem.c[i])) {
      vElem.c.splice(i, 1)
      i--
    }
  }
  let i = pathToVisit.findIndex(p => p === path)
  if (i !== -1) pathToVisit.splice(i, 1)
  return vElem
}









function renderDiff (node, pathToVisit = []) {
  if (!node.f) return node

  const oldChildren = node.c
  const newChildren = [node.f(node.b, { path: node.p, states: tempStates[node.p], n: 0 })]
  
  console.log('children', oldChildren, newChildren)
  node.c = newChildren
  
  

  let i = pathToVisit.findIndex(p => p === node.p)
  if (i !== -1) pathToVisit.splice(i, 1)
  
  return node
}

function cleanEffects () {
  while (effects[0]) {
    effects.shift()()
  }
}

function runTree (tree, paths, callback) {
  let t
  let i = paths.findIndex(p => p === tree.p)
  if (i !== -1) {
    let node = callback({ ...tree }, paths)
    paths.splice(i, 1)
    return node
  } else if (paths.find(p => p.startsWith(tree.p))) {
    t = { ...tree }
    t.c = t.c.map(child => runTree(child, paths, callback))
  }
  return t || tree
}

function update (path) {
  pathToUpdate.push(path)
  if (waitingForFrames) return
  waitingForFrames = true
  reqFrame(() => {
    tempStates = {}
    mergeStates(tempStates)
    const paths = [...new Set(pathToUpdate)].sort()
    pathToUpdate = []
    
    console.log('paths', paths)
    let diffs = []
    let newRootNode
    while (paths[0]) {
      newRootNode = runTree(vDOM, paths, function (node, path) {
        const newNode = renderDiff(node, path)
        diffs.push(vDiff(node, newNode, document.querySelector(`[data-blast-path^="${node.p}"]`)))
        return newNode
      })
      console.log('end', newRootNode, vDOM, paths, deepEqual(newRootNode, vDOM))
    }
    console.log('diffs', diffs.map(a=>a.toString()))
    diffs.forEach(f => f())
    vDOM = newRootNode
    // Refactor this to be in one funcion
    // const nextVDOM = render2(vApp, '.', paths)
    // vDiff(vDOM, nextVDOM, getRoot())()
    // vDOM = nextVDOM
    // End block
    mergeStates(oldStates)
    cleanEffects()
    waitingForFrames = false
  })
}

export function useState (context, defaultValue) {
  if (!context || typeof context !== 'object' || !context.path || !Array.isArray(context.states)) throw new Error('invalid first argument for useState ' + JSON.stringify(context))
  context.n ||= 0
  const n = context.n
  if (!Object.prototype.hasOwnProperty.call(context.states, n)) {
    const d = defaultValue
    context.states[n] = d
    tempStates[context.path][n] = d
    states[context.path][n] = d
  }

  function setState (value) {
    let v = value
    const g = context.states[n]
    if (typeof v === 'function') v = v(g)
    states[context.path][n] = v
    update(context.path)
  }
  context.n++
  return [context.states[n], setState]
}

export function useEffect (context, effect, dependencies) {
  if (!context || typeof context !== 'object' || !context.path || !Array.isArray(context.states)) throw new Error('invalid first argument for useEffect')
  context.n ||= 0
  const n = context.n
  if (!context.states[n]) {
    context.states[n] = {}
    states[context.path][n] = {}
    tempStates[context.path][n] = {}
  }
  if (!Object.prototype.hasOwnProperty.call(context.states[n], 'deps') || !deepEqual(context.states[n].deps, dependencies)) {
    effects.push(() => {
      context.states[n].ext?.()
      states[context.path][n].ext = effect(context.states[n].deps)
      states[context.path][n].deps = dependencies
    })
  }
  context.n++
}

export function useRef (context, defaultValue = null) {
  if (!context || typeof context !== 'object' || !context.path || !Array.isArray(context.states)) throw new Error('invalid first argument for useRef')
  context.n ||= 0
  const n = context.n
  if (!context.states[n]) {
    const refObject = { current: defaultValue }
    context.states[n] = tempStates[context.path][n] = states[context.path][n] = refObject
  }
  context.n++
  return states[context.path][n]
}

export function startContext (context, tunnel, defaultValue) {
  if (!tunnel?.[Symbol.for('BlastContext')]) throw new Error('invalid second argument for startContext')
  context.n ||= 0
  const [v, s] = useState(context, defaultValue)
  tunnel.update = s
  tunnel.value = v
  return v
}

export function useContext (tunnel) {
  if (!tunnel?.[Symbol.for('BlastContext')]) throw new Error('invalid first argument for useContext')
  const g = tunnel.value
  return [g, tunnel.update]
}
export function launch (app, selector) {
  vApp = virtualize(app)
  vDOM = render(vApp)
  mergeStates(oldStates)
  getRoot = () => document.querySelector(selector)
  getRoot().replaceWith(...materialize(vDOM))
  cleanEffects()
}

export default virtualize


/**
 * Render Situations
 * 
 * 
 * 
 * Created
 *  Old:
 *    VirtualNode: undefined
 *    State: undefined
 *  New:
 *    VirtualNode: Object | string
 *    State: Array?
 *  Node: null 
 *  Action: parent.append(...materialized(New))
 * 
 * 
 * Deleted
 *  Old:
 *    VirtualNode: Object | string
 *    State: Array?
 *  New:
 *    VirtualNode: undefined
 *    State: undefined
 *  Node: Node
 *  Action: 
 *    - Node.remove()
 *    - [Remove all descending States]
 * 
 * 
 * Modified (different Component)
 *  Old:
 *    VirtualNode:
 *      Component: A
 *      Props: OldProps
 *    State: OldState
 *  New:
 *    VirtualNode:
 *      Component: B
 *      Props: newProps
 *    State: newState
 *  Node: Node
 *  Action: Node.replaceWith(...materialized(New))
 * 
 * 
 * Modified (different props or state)
 * 
 */