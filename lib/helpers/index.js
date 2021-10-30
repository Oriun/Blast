export function mergeFunc (...func) {
  if (func.some(f => f && typeof f !== 'function')) throw new Error('You can only pass functions here')
  return function (...args) {
    func.forEach(f => f?.(...args))
  }
}
