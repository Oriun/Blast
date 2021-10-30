import Blast, { vShortcut as _, createContext, startContext, useContext, useState, useRef, launch } from 'Blast'
import { ClickOutside, NoOut } from '../lib/intl/index.js'

const mainContext = createContext()

const Box = ({ className = 'boxx', id = '' } = {}) => {
  let c = 2
  return <span id={id}>
    Boxxx {id}
    <Bax className={className} id={id}/>
  </span>
}

const Bax = ({ className = 'boxx', id = '' } = {}) => {
  const [context, update] = useContext(mainContext)
  return <span id={id} onclick={() => update(a => ++a)}>
    Baxxx {context.toString()} {id}
  </span>
}

const Bouton = ({ n = 1 } = {}, $) => {
  const [date, setDate] = useState($, Date.now())
  const ref1 = useRef($, null)
  function close (event) {
    console.log(event.target.tagName)
    setDate(Date.now())
  }
  console.log('date',date)
  return (
    <span id='button' className='btn-class' intl={[NoOut, ClickOutside(close)]} style={{ border: '1px solid grey', padding: '8px' }} data-src='alabama' >
      Hey boy&nbsp; {date}
      <span className='btn-paragraphe' id={n} ref={ref1} >
        Lorem Ipsum {n.toString()}
      </span>
      {n !== 1 ? 
        'Different' : 
        <Box className={n.toString() + $.toString()} id={'alabama'+ n.toString()} />
      }
    </span>
  )
}

const App = ({ n = 0 }, $) => {
  const ctx = useState($, 'Current Task : vDiff function => children diff + attributes separate diff')
  console.log("ctx", ctx)
  const [current, setCurrent] = ctx
  const [nb, setN] = useState($, n)
  const context = startContext($, mainContext, 42)
  window.setC = setCurrent
  return (
    <div intl={[NoOut]}>
      {current}
      Don't forget lazy components,
      <br/>
      ToDo : update from specific node and not the root and propagate to children
      {context}
      <br/>
      <br/>
      <button onclick={() => setN(a => ++a) }>Add 1 to n</button>
      {nb}
      <br/>
      <br/>
      <Bouton n={nb}/>
    </div>
  )
}

window.onload = function () {
  launch(App, '#root')
}
