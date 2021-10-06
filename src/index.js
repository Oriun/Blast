import { vShortcut as _, Component, useState, useEffect, useRef, launch } from '../lib/index.js'


function repeat(n, func) {
  return new Array(n).fill().map((_,i)=>func(i))
}
const span = _('span'), div = _('div'), button = _('button'), br = _('br')
const Box = Component( ({ className = "boxx", id = "" } = {}) => {

  return span({ id },
    "Boxxx",
    id,
    Bax({ className, id })
  )
})

const Bax = Component( ({ className = "boxx", id = "" } = {}) => {
  
  return span({ id },
    "Boxxx",
    id 
  )
})

const Bouton = Component( ({ n = 1 } = {}, _) => {
  const [date, setD] = useState(_,Date.now())
  useEffect(_, lastN=>{
    console.log(lastN, n)
  }, n)
  const ref1 = useRef(_, null)
  console.log("ref1",ref1)
  useEffect(_, ()=>{
    console.log(ref1)
    if(ref1.current){
      console.log('ref is populated with an ' + ref1.current.constructor.name)
    }
  })
  return (
    span({ id: "button", className: "btn-class", style: { border: "1px solid grey", padding: "8px" }, onclick: ()=>console.log('yoooo'), "data-src": "alabama" },
      "Hey boy ",
      date,
      span({ className: "btn-paragraphe", id: n, ref: ref1 },
        "Lorem Ipsum " + n.toString()
      ),
      n != 1 ? "Different" : Box({ className: n.toString() + _.toString(), id: "alabama" + n.toString()})
    )
  )
})

const App = Component( ({ n = 0 }, _) => {
  const [current, setCurrent] = useState(_, "Current Task : vDiff function => children diff + attributes separate diff")
  const [nb, setN] = useState(_, n)
  window.setC = setCurrent
  return div({ id : "root" },
    current,
    "Idée : Props intelligents (ex: Propagate={true|false} pour stop la propagation des clics",
    br(),
    br(),
    button({ onclick: ()=>setN(a=>++a) }, "Add 1 to n"),
    br(),
    br(),
    Bouton({ n: nb })
  )
})

window.onload = function(){
  launch(App(),'#root')
}

