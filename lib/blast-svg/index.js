const BlastJSX = require('@oriun/blast-jsx')

module.exports = function (content) {
    const i = content.split('svg', 1)[0].length + 3
    return BlastJSX(`import Blast from "@oriun/blast"; export default (p = {})=>(${content.slice(0, i)} {...p}${content.slice(i)})`)
}