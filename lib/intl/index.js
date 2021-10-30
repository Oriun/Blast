import { mergeFunc } from '../helpers/index.js'

export function NoOut (element) {
  element.onclick = mergeFunc(e => e.stopPropagation(), element.onClick)
}

export function Quiet (element) {
  element.onclick = mergeFunc(e => e.preventDefault(), element.onClick)
  return element
}

export function LinkOut (url, newTab = true) {
  const target = newTab ? '_blank' : '_self'
  return function (element) {
    if (element.tagName === 'A') {
      element.href = url
      element.target = target
      element.rel = 'noreferrer noopener'
    } else {
      element.onclick = mergeFunc(element.onClick, () => window.open(url, target))
    }
  }
}

const clickOutsideObservers = []

document.addEventListener('mouseup', function (event) {
  let elem = event.target
  let observed = [...clickOutsideObservers]
  while (elem) {
    observed = observed.filter(obs => elem !== obs.element)
    elem = elem.parentNode
  }
  for (let i = observed.length - 1; i >= 0; i--) {
    if (observed[i].element.isConnected) observed[i].handler(event)
    //else clickOutsideObservers.splice(i, 1)
  }
})

export function ClickOutside (handler) {
  if (typeof handler !== 'function') throw new Error('You can only pass functions here')
  return function (element) {
    clickOutsideObservers.push({ element, handler })
  }
}
