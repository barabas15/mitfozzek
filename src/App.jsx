import { useState, useEffect } from 'react'
import { auth, provider, signInWithPopup } from './firebase.js'
import './App.css'

const API = '/api'
const NOSALTY = 'https://www.nosalty.hu/recept'

const defaultAppetizers = [
  { name: 'Póréhagyma krémleves', url: `${NOSALTY}/porehagyma-kremleves` },
  { name: 'Brokkoli krémleves', url: `${NOSALTY}/brokkoli-kremleves-3` },
  { name: 'Lencse (vörös) krémleves', url: `${NOSALTY}/lencseleves` },
  { name: 'Zeller krémleves', url: `${NOSALTY}/szarzeller-kremleves` },
  { name: 'Barack, meggyleves', url: `${NOSALTY}/meggyleves` },
  { name: 'Édesburgonya & jalapeño leves', url: `${NOSALTY}/edesburgonya-leves` },
  { name: 'Sütőtök krémleves', url: `${NOSALTY}/sutotokleves` },
  { name: 'Spárga krémleves', url: `${NOSALTY}/spargakremleves` },
  { name: 'Tojásleves', url: `${NOSALTY}/tojasleves` },
  { name: 'Krumplileves', url: `${NOSALTY}/kolbaszos-krumplileves` },
  { name: 'Grízgombóc leves', url: `${NOSALTY}/medvehagymas-grizgombocleves-cseh-kucsmagombaval` },
  { name: 'Zöldborsó krémleves', url: `${NOSALTY}/legegyszerubb-zoldborso-kremleves` },
  { name: 'Nyírségi gombócleves', url: `${NOSALTY}/nyirsegi-gombocleves` },
  { name: 'Tárkonyos ragúleves', url: `${NOSALTY}/tarkonyos-raguleves` },
  { name: 'Frankfurti leves', url: `${NOSALTY}/frankfurti-leves-3` },
  { name: 'Gomba krémleves', url: `${NOSALTY}/selymes-sultgomba-kremleves` },
  { name: 'Kukorica krémleves', url: `${NOSALTY}/kukorica-kremleves` },
  { name: 'Bableves', url: `${NOSALTY}/husveti-bableves-gazdagon` },
  { name: 'Gulyásleves', url: `${NOSALTY}/gulyasleves` },
  { name: 'Húsleves', url: `${NOSALTY}/tokeletes-husleves` },
  { name: 'Currys krumpileves', url: `${NOSALTY}/currys-burgonyaleves` },
  { name: 'Csicseriborsó krémleves + bacon', url: `${NOSALTY}/csicseriborso-kremleves` },
  { name: 'Pho leves', url: `${NOSALTY}/pho-leves` },
  { name: 'Paradicsomleves', url: `${NOSALTY}/paradicsomleves` },
  { name: 'Tom ka ghai', url: `${NOSALTY}/tom-kha-gai-thai-kokuszos-csirkeleves` },
]

const defaultMains = [
  { name: 'Bolognai', url: `${NOSALTY}/bolognai-spagetti` },
  { name: 'Lasagne', url: `${NOSALTY}/lasagne` },
  { name: 'Cannelloni', url: `${NOSALTY}/cannelloni` },
  { name: 'Brassói', url: `${NOSALTY}/brassoi-apropecsenye` },
  { name: 'Rántott hús', url: `${NOSALTY}/rantott-hus` },
  { name: 'Gyros', url: `${NOSALTY}/gyros-hazilag` },
  { name: 'Székelykáposzta', url: `${NOSALTY}/szekelykaposzta` },
  { name: 'Lecsó', url: `${NOSALTY}/lecso` },
  { name: 'Fasírt', url: `${NOSALTY}/fasirt` },
  { name: 'Mézes mustáros gombóc', url: 'https://cookpad.com/hu/receptek/11685601' },
  { name: 'Pizza', url: `${NOSALTY}/pizza` },
  { name: 'Tejfölös csirke', url: `${NOSALTY}/tejfolos-csirke` },
  { name: 'Ázsiai tészta', url: `${NOSALTY}/mogyoroszoszos-azsiai-teszta` },
  { name: 'Indiai tikka', url: `${NOSALTY}/csirke-tikka-masala-2` },
  { name: 'Indiai spenótos krumplis csirke', url: 'https://streetkitchen.hu/receptek/indiai-spenotos-csirke' },
  { name: 'Sztrapacska', url: `${NOSALTY}/sztrapacska` },
  { name: 'Gombapaprikás', url: `${NOSALTY}/gombapaprikas-2` },
  { name: 'Shakshuka', url: `${NOSALTY}/shakshuka` },
  { name: 'Töltött cukkíni', url: `${NOSALTY}/toltott-cukkini` },
  { name: 'Rakott kel', url: `${NOSALTY}/rakott-kel` },
  { name: 'Rakott krumpli', url: `${NOSALTY}/rakott-krumpli` },
  { name: 'Töltött paprika', url: `${NOSALTY}/toltott-paprika` },
  { name: 'Tepsis csirke', url: 'https://www.mindmegette.hu/alapetelek/tepsis-csirke-recept-egyszeru-gyors-vacsora' },
  { name: 'Krumplifőzelék', url: `${NOSALTY}/krumplifozelek` },
  { name: 'Lencsefőzelék', url: `${NOSALTY}/lencsefozelek` },
  { name: 'Borsófőzelék', url: `${NOSALTY}/borsofozelek` },
  { name: 'Sárgaborsófőzelék', url: `${NOSALTY}/sargaborso-fozelek` },
  { name: 'Aranygaluska', url: `${NOSALTY}/aranygaluska-2` },
  { name: 'Túrós tészta', url: `${NOSALTY}/turos-teszta-alaprecept` },
  { name: 'Padthai', url: `${NOSALTY}/padthai-legtutibb-randikaja` },
  { name: 'Rántott sajt', url: `${NOSALTY}/rantott-sajt-toltve` },
  { name: 'Paradicsomos húsgombóc', url: `${NOSALTY}/paradicsomos-husgomboc` },
  { name: 'Túrógombóc', url: `${NOSALTY}/turogomboc-hagyomanyos` },
  { name: 'Indiai krumplistészta', url: `${NOSALTY}/krumplis-teszta` },
  { name: 'Grízes tészta', url: `${NOSALTY}/grizes-teszta` },
  { name: 'Chilis bab', url: `${NOSALTY}/laktato-chilis-bab` },
  { name: 'Paprikás krumpli', url: `${NOSALTY}/paprikas-krumpli` },
  { name: 'Tejszínes brokkolis, borsós csirkés tészta', url: `${NOSALTY}/brokkolis-csirkes-teszta` },
  { name: 'Oldalas', url: `${NOSALTY}/omlos-oldalas` },
  { name: 'Fried rice', url: `${NOSALTY}/chicken-fried-rice` },
  { name: 'Enchilada', url: `${NOSALTY}/enchilada` },
]

function initList(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.length && typeof parsed[0] === 'string') {
        return parsed.map(n => { const f = fallback.find(i => i.name === n); return { name: n, url: f?.url || '' } })
      }
      if (parsed.length && 'image' in parsed[0]) {
        return parsed.map(({ name }) => { const f = fallback.find(i => i.name === name); return { name, url: f?.url || '' } })
      }
      return parsed.map(item => { if (item.url) return item; const f = fallback.find(i => i.name === item.name); return f ? { ...item, url: f.url } : item })
    }
  } catch {}
  return fallback
}

function loadHidden(key) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : [] } catch { return [] }
}

async function translate(text, sl, tl) {
  if (!text) return text
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`)
  const data = await res.json()
  return data[0].map(p => p[0]).join('')
}

async function translateAll(recipe) {
  const [name, category, area, ingredients, instructions] = await Promise.all([
    translate(recipe.name, 'en', 'hu'),
    translate(recipe.category, 'en', 'hu'),
    translate(recipe.area, 'en', 'hu'),
    Promise.all(recipe.ingredients.map(i => translate(i, 'en', 'hu'))),
    translate(recipe.instructions, 'en', 'hu'),
  ])
  return { ...recipe, name, category, area, ingredients, instructions }
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function mergeItems(saved, defaults) {
  const map = new Map()
  for (const item of defaults) map.set(item.name, item)
  for (const item of saved) map.set(item.name, item)
  return [...map.values()]
}

function FoodRow({ item, label }) {
  return (
    <>
      <p className="card-label">{label}</p>
      <div className="food-row">
        {item.url ? (
          <a className="food-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>
        ) : (
          <span className="card-food">{item.name}</span>
        )}
      </div>
    </>
  )
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('mifozzek-token'))
  const [user, setUser] = useState(null)
  const [appetizers, setAppetizers] = useState(() => initList('mifozzek-appetizers', defaultAppetizers))
  const [mains, setMains] = useState(() => initList('mifozzek-mains', defaultMains))
  const [hiddenAppetizers, setHiddenAppetizers] = useState(() => loadHidden('mifozzek-hidden-appetizers'))
  const [hiddenMains, setHiddenMains] = useState(() => loadHidden('mifozzek-hidden-mains'))
  const [desserts, setDesserts] = useState(() => initList('mifozzek-desserts', []))
  const [hiddenDesserts, setHiddenDesserts] = useState(() => loadHidden('mifozzek-hidden-desserts'))
  const [suggestion, setSuggestion] = useState({ appetizer: null, main: null })
  const [loading, setLoading] = useState(false)
  const [apiRecipe, setApiRecipe] = useState(null)
  const [dessertRecipe, setDessertRecipe] = useState(null)
  const [dessertLoading, setDessertLoading] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)
  const [page, setPage] = useState('main')
  const [openSections, setOpenSections] = useState({ appetizer: false, main: false, dessert: false })
  const [savedDessertsOpen, setSavedDessertsOpen] = useState(false)

  useEffect(() => {
    if (!token) { setUser(null); return }
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setAppetizers(mergeItems(data.user.appetizers || [], defaultAppetizers))
          setMains(mergeItems(data.user.mains || [], defaultMains))
          setDesserts(mergeItems(data.user.desserts || [], []))
        }
      })
      .catch(() => setUser(null))
  }, [token])

  useEffect(() => { if (!user) localStorage.setItem('mifozzek-appetizers', JSON.stringify(appetizers)) }, [appetizers, user])
  useEffect(() => { if (!user) localStorage.setItem('mifozzek-mains', JSON.stringify(mains)) }, [mains, user])
  useEffect(() => { if (!user) localStorage.setItem('mifozzek-desserts', JSON.stringify(desserts)) }, [desserts, user])
  useEffect(() => { localStorage.setItem('mifozzek-hidden-appetizers', JSON.stringify(hiddenAppetizers)) }, [hiddenAppetizers])
  useEffect(() => { localStorage.setItem('mifozzek-hidden-mains', JSON.stringify(hiddenMains)) }, [hiddenMains])
  useEffect(() => { localStorage.setItem('mifozzek-hidden-desserts', JSON.stringify(hiddenDesserts)) }, [hiddenDesserts])

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      const res = await fetch('/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      localStorage.setItem('mifozzek-token', data.token)
      setToken(data.token)
    } catch {}
  }

  function handleSuggest() {
    setApiRecipe(null)
    setDessertRecipe(null)
    setSavedMsg(null)
    const avail = { appetizer: appetizers.filter(i => !hiddenAppetizers.includes(i.name)), main: mains.filter(i => !hiddenMains.includes(i.name)) }
    if (!avail.appetizer.length || !avail.main.length) return
    setSuggestion({ appetizer: { ...pickRandom(avail.appetizer) }, main: { ...pickRandom(avail.main) } })
  }

  async function handleNew() {
    setSuggestion({ appetizer: null, main: null })
    setDessertRecipe(null)
    setLoading(true); setApiRecipe(null); setSavedMsg(null)
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      const data = await res.json()
      const meal = data.meals[0]
      const ingredients = []
      for (let i = 1; i <= 20; i++) { const n = meal[`strIngredient${i}`]; const a = meal[`strMeasure${i}`]; if (n) ingredients.push(`${a} ${n}`) }
      const recipe = { id: meal.idMeal, name: meal.strMeal, category: meal.strCategory, area: meal.strArea, ingredients, instructions: meal.strInstructions, image: meal.strMealThumb, url: `https://www.themealdb.com/meal/${meal.idMeal}` }
      setApiRecipe(await translateAll(recipe))
    } catch { setApiRecipe({ name: 'Hiba történt az API hívás során' }) }
    setLoading(false)
  }

  async function handleDessert() {
    setSuggestion({ appetizer: null, main: null })
    setApiRecipe(null)
    setDessertLoading(true)
    setDessertRecipe(null)
    setSavedMsg(null)
    try {
      const filterRes = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert')
      const filterData = await filterRes.json()
      const meals = filterData.meals
      if (!meals) throw new Error('No desserts')
      const random = meals[Math.floor(Math.random() * meals.length)]
      const lookupRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${random.idMeal}`)
      const lookupData = await lookupRes.json()
      const meal = lookupData.meals[0]
      const ingredients = []
      for (let i = 1; i <= 20; i++) { const n = meal[`strIngredient${i}`]; const a = meal[`strMeasure${i}`]; if (n) ingredients.push(`${a} ${n}`) }
      const recipe = { id: meal.idMeal, name: meal.strMeal, category: meal.strCategory, area: meal.strArea, ingredients, instructions: meal.strInstructions, image: meal.strMealThumb, url: `https://www.themealdb.com/meal/${meal.idMeal}` }
      setDessertRecipe(await translateAll(recipe))
    } catch { setDessertRecipe({ name: 'Hiba történt az API hívás során' }) }
    setDessertLoading(false)
  }

  async function handleSave(type) {
    const recipe = type === 'dessert' ? dessertRecipe : apiRecipe
    const { name, url } = recipe || {}
    if (!name) return
    const field = type === 'appetizer' ? 'appetizers' : type === 'main' ? 'mains' : 'desserts'
    if (user && token) {
      try {
        const res = await fetch(`${API}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type, name, url: url || '' }),
        })
        if (res.status === 409) { setSavedMsg('Már szerepel a listában!'); return }
        const data = await res.json()
        setAppetizers(mergeItems(data.appetizers || [], defaultAppetizers))
        setMains(mergeItems(data.mains || [], defaultMains))
        setDesserts(mergeItems(data.desserts || [], []))
        setSavedMsg(`"${name}" elmentve!`)
      } catch { setSavedMsg('Hiba mentés közben') }
    } else {
      const list = type === 'appetizer' ? appetizers : type === 'main' ? mains : desserts
      const setter = type === 'appetizer' ? setAppetizers : type === 'main' ? setMains : setDesserts
      if (list.some(i => i.name === name)) { setSavedMsg('Már szerepel a listában!'); return }
      setter(prev => [...prev, { name, url: url || '' }])
      setSavedMsg(`"${name}" elmentve!`)
    }
  }

  async function handleDeleteItem(type, item) {
    if (user && token) {
      try {
        await fetch(`${API}/items?type=${type}&name=${encodeURIComponent(item.name)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {}
    }
    const setHidden = type === 'appetizer' ? setHiddenAppetizers : type === 'main' ? setHiddenMains : setHiddenDesserts
    setHidden(prev => [...prev, item.name])
    const setter = type === 'appetizer' ? setAppetizers : type === 'main' ? setMains : setDesserts
    setter(prev => prev.filter(i => i.name !== item.name))
  }

  function handleLogout() {
    localStorage.removeItem('mifozzek-token')
    setToken(null); setUser(null)
    setAppetizers(initList('mifozzek-appetizers', defaultAppetizers))
    setMains(initList('mifozzek-mains', defaultMains))
    setDesserts(initList('mifozzek-desserts', []))
  }

  if (page === 'foods') {
    const showApps = appetizers.filter(i => !hiddenAppetizers.includes(i.name))
    const showMains = mains.filter(i => !hiddenMains.includes(i.name))
    const showDesserts = desserts.filter(i => !hiddenDesserts.includes(i.name))
    function Section({ label, count, open, onToggle, children }) {
      return (
        <div className="food-list" style={!open ? {} : undefined}>
          <button className="section-header" onClick={onToggle}>
            <span className="section-arrow">{open ? '▼' : '▶'}</span>
            <span className="section-label">{label} ({count})</span>
          </button>
          {open && children}
        </div>
      )
    }
    return (
      <div className="app">
        <div className="header">
          <span className="header-icon">🍳</span>
          <h1>Ételeim</h1>
          <button className="btn btn-back" onClick={() => setPage('main')}>Vissza</button>
        </div>
        <Section label="Előételek" count={showApps.length} open={openSections.appetizer} onToggle={() => setOpenSections(s => ({ ...s, appetizer: !s.appetizer }))}>
          {showApps.map(item => (
            <div className="food-list-row" key={item.name}>
              {item.url ? <a className="food-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a> : <span className="card-food">{item.name}</span>}
              <button className="btn btn-delete" onClick={() => handleDeleteItem('appetizer', item)}>✕</button>
            </div>
          ))}
        </Section>
        <Section label="Főételek" count={showMains.length} open={openSections.main} onToggle={() => setOpenSections(s => ({ ...s, main: !s.main }))}>
          {showMains.map(item => (
            <div className="food-list-row" key={item.name}>
              {item.url ? <a className="food-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a> : <span className="card-food">{item.name}</span>}
              <button className="btn btn-delete" onClick={() => handleDeleteItem('main', item)}>✕</button>
            </div>
          ))}
        </Section>
        <Section label="Desszertek" count={showDesserts.length} open={openSections.dessert} onToggle={() => setOpenSections(s => ({ ...s, dessert: !s.dessert }))}>
          {showDesserts.map(item => (
            <div className="food-list-row" key={item.name}>
              {item.url ? <a className="food-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a> : <span className="card-food">{item.name}</span>}
              <button className="btn btn-delete" onClick={() => handleDeleteItem('dessert', item)}>✕</button>
            </div>
          ))}
        </Section>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        {user && (
          <button className="btn-foods" onClick={() => setPage('foods')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
            Ételeim
          </button>
        )}
        <span className="header-icon">🍳</span>
        <h1>Mit főzzek ma?</h1>
        <p className="subtitle">Ha nincs ötleted, segítünk</p>
        {user ? (
          <div className="user-info">
            {user.photo && <img src={user.photo} alt="" className="user-photo" referrerPolicy="no-referrer" />}
            <span className="user-name">{user.displayName}</span>
            <button className="btn-logout" onClick={handleLogout} title="Kijelentkezés">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            </button>
          </div>
        ) : (
          <div className="auth-section">
            <button className="btn btn-google" onClick={handleGoogleLogin}><svg viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg> Bejelentkezés</button>
            <p className="login-prompt">Jelentkezz be, hogy saját ételeket menthess el és új recepteket próbálhass ki!</p>
          </div>
        )}
      </div>
      <div className="buttons">
        <button className="btn btn-primary" onClick={handleSuggest}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.47-1.47-4.21-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>
            Mit főzzek?
          </button>
        {user && <button className="btn btn-secondary" onClick={handleNew}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C8.9 2 5.9 3.5 4 5.8L12 22l8-16.2C18.1 3.5 15.1 2 12 2zM8.5 9.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5S10 7.2 10 8s-.7 1.5-1.5 1.5zm3.5 4.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/></svg>
            Új étel
          </button>}
        <button className="btn btn-dessert" onClick={handleDessert}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.74-.26-1.06L12 0l-1.74 2.94C10.1 3.26 10 3.62 10 4c0 1.1.9 2 2 2z"/><path d="M18 10h-5V7h-2v3H6c-1.66 0-3 1.34-3 3v7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-7c0-1.66-1.34-3-3-3zM4 20v-5h2v5H4zm4 0v-5h2v5H8zm4 0v-5h2v5h-2zm4 0v-5h2v5h-2z"/></svg>
            Desszertre vágyom
          </button>
      </div>
      <div className="divider">JAVASLAT</div>

      {suggestion.appetizer && (
        <div className="card">
          <FoodRow item={suggestion.appetizer} label="Előétel" />
          <div style={{ height: '0.5rem' }} />
          <FoodRow item={suggestion.main} label="Főétel" />
        </div>
      )}
      {loading && <p className="loading card" style={{padding:'1.5rem'}}>Betöltés...</p>}
      {dessertLoading && <p className="loading card" style={{padding:'1.5rem'}}>Betöltés...</p>}

      {(dessertRecipe || dessertLoading) && (() => {
        const saved = desserts.filter(i => !hiddenDesserts.includes(i.name))
        if (!saved.length) return null
        return (
          <div className="food-list" style={{ marginBottom: '1rem' }}>
            <button className="section-header" onClick={() => setSavedDessertsOpen(o => !o)}>
              <span className="section-arrow">{savedDessertsOpen ? '▼' : '▶'}</span>
              <span className="section-label">Saját desszertek ({saved.length})</span>
            </button>
            {savedDessertsOpen && saved.map(item => (
              <div className="food-list-row" key={item.name}>
                {item.url ? <a className="food-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a> : <span className="card-food">{item.name}</span>}
              </div>
            ))}
          </div>
        )
      })()}

      {dessertRecipe && (
        <div className="recipe-card">
          {dessertRecipe.image && <img src={dessertRecipe.image} alt={dessertRecipe.name} />}
          <div className="recipe-body">
            {dessertRecipe.url ? <h2><a className="recipe-title-link" href={dessertRecipe.url} target="_blank" rel="noopener noreferrer">{dessertRecipe.name}</a></h2> : <h2>{dessertRecipe.name}</h2>}
            {dessertRecipe.category && <p className="recipe-meta">{dessertRecipe.category} &middot; {dessertRecipe.area}</p>}
            {dessertRecipe.ingredients && <><h3>Hozzávalók</h3><ul>{dessertRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul></>}
            {dessertRecipe.instructions && <><h3>Elkészítés</h3><p className="instructions">{dessertRecipe.instructions}</p></>}
            {user && (
              <div className="save-section">
                <p className="save-label">Mentsd el a saját listádba:</p>
                <div className="save-buttons">
                  <button className="btn btn-save" onClick={() => handleSave('dessert')}>Desszertként</button>
                </div>
                {savedMsg && <p className="saved-msg">{savedMsg}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {apiRecipe && (
        <div className="recipe-card">
          {apiRecipe.image && <img src={apiRecipe.image} alt={apiRecipe.name} />}
          <div className="recipe-body">
            {apiRecipe.url ? <h2><a className="recipe-title-link" href={apiRecipe.url} target="_blank" rel="noopener noreferrer">{apiRecipe.name}</a></h2> : <h2>{apiRecipe.name}</h2>}
            {apiRecipe.category && <p className="recipe-meta">{apiRecipe.category} &middot; {apiRecipe.area}</p>}
            {apiRecipe.ingredients && <><h3>Hozzávalók</h3><ul>{apiRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul></>}
            {apiRecipe.instructions && <><h3>Elkészítés</h3><p className="instructions">{apiRecipe.instructions}</p></>}
            <div className="save-section">
              <p className="save-label">Mentsd el a saját listádba:</p>
              <div className="save-buttons">
                <button className="btn btn-save" onClick={() => handleSave('appetizer')}>Előételként</button>
                <button className="btn btn-save" onClick={() => handleSave('main')}>Főételként</button>
              </div>
              {savedMsg && <p className="saved-msg">{savedMsg}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
