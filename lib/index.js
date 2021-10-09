let count = 0
const oldStates = {}
const states = {}
let vDOM = {}
let vApp = null
let getRoot = null
const effects = []
let waitingForFrames = false

const reqFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame

export function createContext (defaultValue) {
  const updateTunnel = {}
  updateTunnel[Symbol.for('BlastContext')] = true
  return updateTunnel
}

function mergeStates () {
  for (const path in states) {
    oldStates[path] = [...states[path]]
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

function virtualize (tagName, attrs = {}, ...children) {
  let key
  if (attrs.key) {
    key = attrs.key
    delete attrs.key
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
    } else if (attr.startsWith('on') || attr === 'className') {
      elem[attr] = a[attr]
    } else {
      elem.setAttribute(attr, a[attr])
    }
  }
  elem.setAttribute('data-blast-ukey', ukey)
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
  // We assume the two tree exists
  if (typeof oldTree === 'string') {
    if (typeof newTree !== 'string') {
      return () => {
        rootElem.replaceWith(...materialize(newTree))
      }
    } else if (oldTree !== newTree) {
      return () => {
        rootElem.textContent = newTree
      }
    } else {
      return () => {}
    }
  } else if (typeof newTree === 'string') {
    return () => {
      rootElem.replaceWith(newTree)
    }
  } else if (oldTree.key !== newTree.key) {
    return () => {
      rootElem.replaceWith(...materialize(newTree))
    }
  } else if (oldTree.t !== newTree.t || oldTree.f?.toString() !== newTree.f?.toString()) {
    return () => {
      rootElem.replaceWith(...materialize(newTree))
    }
  } else if (newTree.t && !deepEqual(oldTree.a, newTree.a)) {
    return () => {
      rootElem.replaceWith(...materialize(newTree))
    }
  } else if (newTree.f) {
    if (!deepEqual(oldTree.b, newTree.b) || !deepEqual(oldStates[oldTree.p], states[newTree.p])) {
      return () => {
        rootElem.replaceWith(...materialize(newTree))
      }
    }
  }

  return () => console.log('nothing to do')
}

function isStringable (t) {
  switch (typeof t) {
    case 'string':
    case 'number':
    case 'boolean':
      return true
    default: return false
  }
}

export function Component (f) {
  return function (props = {}, ...c) {
    let key
    if (props.key) {
      key = props.key
      delete props.key
    }
    return {
      b: { ...props, children: c },
      f,
      key
    }
  }
}

function render (root, path = '#') {
  const vElem = root
  vElem.p = path
  if (vElem.f) {
    states[path] ||= []
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

function cleanEffects () {
  while (effects[0]) {
    effects.shift()()
  }
}

function update () {
  if (waitingForFrames) return
  waitingForFrames = true
  reqFrame(() => {
    waitingForFrames = false
    const nextVDOM = render(vApp)
    vDiff(vDOM, nextVDOM, getRoot())()
    mergeStates()
    vDOM = nextVDOM
    cleanEffects()
  })
}

export function useState (context, defaultValue) {
  if (!context || typeof context !== 'object' || !context.path || !Array.isArray(context.states)) throw new Error('invalid first argument for useState')
  context.n ||= 0
  const n = context.n
  if (!Object.prototype.hasOwnProperty.call(context.states, n)) {
    const d = defaultValue
    context.states[n] = d
    states[context.path][n] = d
  }

  function setState (value) {
    let v = value
    const g = context.states[n]
    if (typeof v === 'function') v = v(g)
    states[context.path][n] = v
    update()
  }
  context.n++
  return [context.states[n], setState]
}

export function useEffect (context, effect, dependencies) {
  if (!context || typeof context !== 'object' || !context.path || !Array.isArray(context.states)) throw new Error('invalid first argument for useEffect')
  context.n ||= 0
  const n = context.n
  if (!context.states[n]) {
    context.states[n] = states[context.path][n] = {}
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
    context.states[n] = states[context.path][n] = refObject
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
  vApp = app
  vDOM = render(vApp)
  mergeStates()
  getRoot = () => document.querySelector(selector)
  getRoot().replaceWith(...materialize(vDOM))
  cleanEffects()
}
