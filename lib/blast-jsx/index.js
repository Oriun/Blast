const babel = require("@babel/core")

module.exports = function (source) {
  const { code } = babel.transformSync(source, {
    plugins: [
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "classic",
          pragma: "Blast.virtualize",
          throwIfNamespace: false
        }
      ]
    ],
  })
  return code
}
