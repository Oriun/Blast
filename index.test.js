import { span, div, br, repeat, Component, useState, launch } from './src/index.t2.mjs'

const Box = Component( ({ className = "boxx", id = "" } = {}, path) => {

  return span({ id },
    "Boxxx",
    id,
    Bax({ className, id })
  )
})

const Bax = Component( ({ className = "boxx", id = "" } = {}, path) => {
  
  return span({ id },
    "Boxxx",
    id 
  )
})

const Bouton = Component( ({ n = 1 } = {}, _) => {
  const [date, setD] = useState(_,Date.now())
  return (
    span({ id: "button", className: "btn-class", style: { border: "1px solid grey", padding: "8px" }, onclick: ()=>console.log('yoooo'), "data-src": "alabama" },
      "Hey boy ",
      date,
      span({ className: "btn-paragraphe", id: n },
        "Lorem Ipsum " + n.toString()
      ),
      n != 1 ? "Different" : Box({ className: n.toString() + _.toString(), id: "alabama" + n.toString()})
    )
  )
})

const App = Component( ({ n }, _) => {
  const [current, setCurrent] = useState(_, "Current Task : vDiff function")
  window.setC = setCurrent
  return div({ id : "root" },
    current,
    br(),
    br(),
    Bouton({ n })
  )
})

window.onload = function(){
  launch(App(),'#root')
}

