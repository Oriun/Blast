const babel = require("@babel/core")

function processJSX(source) {
  var { code } = babel.transformSync(source,{
    plugins: [
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "classic",
          pragma: "Blast.virtualize"
        }
      ]
    ],
  })
  //console.log('\n\n\n\n\n',code,'\n\n\n\n\n')
  return code
}

module.exports = processJSX
