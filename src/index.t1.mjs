
var count = 0

export function createElement(tagName, attrs = {}, ...children) {
  //const ukey = ++count
  var elem = document.createElement(tagName)
  for(const attr in attrs) {
    if(attr === "style" && typeof attrs[attr] === "object"){
      var style = Object.entries(attrs.style).map(a=>`${a[0]}: ${a[1]}`).join('; ')
      elem.style = style
    } else if (attr.startsWith('on')) {
      elem[attr] = attrs[attr]
    } else {
      elem.setAttribute(attr,attrs[attr])
    }
  }
  //elem.setAttribute("data-blast-ukey", ukey)
  elem.append(...children.flat(Infinity))
  return elem
}

export function virtualize(tagName, attrs = {}, ...children) {
  return {
    t: tagName,
    a: attrs,
    c: children.flat(Infinity)
  }
}

const orphanTags = ["br","hr","input","img","track","link","meta","base","meta"]

function isStringable(t) {
  switch(typeof t){
    case "string":
    case "number":
    case "boolean":
      return true;
    default: return false;
  }
}

window.toRegister = []

export function writeElement(tagName, attrs = {}, ...children) {
  const ukey = ++count
  var writeable = ""
  for(const attr in attrs) {
    if(attr === "style" && typeof attrs[attr] === "object"){
      writeable += `style="${Object.entries(attrs[attr]).map(a=>`${a[0]}: ${a[1]}`).join('; ').replace(/"/gm,'\\"')}" `
    } else if(isStringable(attrs[attr])) {
      writeable += `${attr.replace(/"/gm,'\\"')}="${attrs[attr].replace(/"/gm,'\\"')}" `
    } else{
      toRegister[ukey] ||= {}
      toRegister[ukey][attr] = attrs[attr]
    }
  }
  const base = `<${tagName} data-blast-ukey="${ukey}" ${writeable} `
  if(orphanTags.includes(tagName)){
    return base + " />"
  }else{
    return base + `>${children.flat(Infinity).join('')}</${tagName}>`
  }
}

function preset(tagName) {
  return function(attrs = {}, ...children) {
    //return createElement(tagName, attrs, children)
    return virtualize(tagName, attrs, children)
  }
}

export function cleanRegister() {
  for(const key in toRegister) {
    const element = document.querySelector(`[data-blast-ukey="${key}"]`)
    for(const attr in toRegister[key]) {
      if(attr.startsWith('on')) element[attr] = toRegister[key][attr]
      else element.setAttribute(attr, toRegister[key][attr])
    }
  }
}

export function repeat(n, func) {
  return new Array(n).fill().map(func)
}

export const div  = preset('div')
export const span = preset('span')
export const p    = preset('p')
export const h1   = preset('h1')
export const img  = preset('img')

const Blast = {
  div,
  span,
  p,
  h1,
  img,
  repeat,
  cleanRegister,
  writeElement,
  createElement
}

export default Blast
