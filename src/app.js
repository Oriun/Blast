import { vShortcut as _, createContext, startContext, useContext, Component, useState, useRef, launch } from '../lib/index.js'

const mainContext = createContext(56)

const span = _('span'); const div = _('div'); const button = _('button'); const br = _('br')

const Box = Component(({ className = 'boxx', id = '' } = {}) => {
  return span({ id },
    'Boxxx',
    id,
    Bax({ className, id })
  )
})

const Bax = Component(({ className = 'boxx', id = '' } = {}) => {
  const [context, update] = useContext(mainContext)
  return span({ id, onclick: () => update(a => ++a) },
    'Baxxx',
    context.toString(),
    id
  )
})

const Bouton = Component(({ n = 1 } = {}, $) => {
  const [date] = useState($, Date.now())
  const ref1 = useRef($, null)
  return (
    span({ id: 'button', className: 'btn-class', style: { border: '1px solid grey', padding: '8px' }, 'data-src': 'alabama' },
      'Hey boy ',
      date,
      span({ className: 'btn-paragraphe', id: n, ref: ref1 },
        'Lorem Ipsum ' + n.toString()
      ),
      n !== 1 ? 'Different' : Box({ className: n.toString() + $.toString(), id: 'alabama' + n.toString() })
    )
  )
})

const App = Component(({ n = 0 }, $) => {
  const [current, setCurrent] = useState($, 'Current Task : vDiff function => children diff + attributes separate diff')
  const [nb, setN] = useState($, n)
  const context = startContext($, mainContext, 42)
  window.setC = setCurrent
  return div({ id: 'root' },
    current,
    'Idée : Props intelligents (ex: Propagate={true|false} pour stop la propagation des clics)',
    context,
    br(),
    br(),
    button({ onclick: () => setN(a => ++a) }, 'Add 1 to n'),
    nb,
    br(),
    br(),
    Bouton({ n: nb })
  )
})

window.onload = function () {
  launch(App(), '#root')
}
