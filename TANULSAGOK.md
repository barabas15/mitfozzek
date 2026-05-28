# Firebase Auth + Vercel — tanulságok

## Firebase Auth Google bejelentkezés

### Popup vs Redirect

| Módszer | Mikor használd | Probléma |
|---------|---------------|----------|
| `signInWithPopup` | **Alapértelmezett** — desktop, normál mobil böngésző | `disallowed_useragent` in-app browserekben (Messenger, Facebook, Gmail, Instagram) |
| `signInWithRedirect` | In-app browserbe próbálkozásként | Ugyanaz a user-agent blokk. A legtöbb in-app browserben **nem működik** sem a popup, sem a redirect |

**Tanulság:** In-app browserekben Google OAuth sosem fog működni. Ne vesztegesd az időt redirect/alternatív flow-kkal. Detektáld a user-agent-et és kérd a felhasználót, hogy nyissa meg a rendszer böngészőjében.

```js
const isInAppBrowser = /FBAN|FBAV|FB_IAB|FBBROWSER|Instagram|Messenger|Gmail/i.test(navigator.userAgent)
```

### `onAuthStateChanged` használata

`signInWithRedirect` + `getRedirectResult` nem megbízható — a Firebase SDK feldolgozza a redirect eredményét mielőtt a React komponens mountolna. Helyette:

```js
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser && !localStorage.getItem('mifozzek-token')) {
      // redirect utáni első betöltés — exchange idToken -> JWT
    }
  })
  return unsubscribe
}, [])
```

A `!localStorage.getItem('mifozzek-token')` guard megakadályozza, hogy a popupos bejelentkezés után is lefusson (ami duplikált token exchange-höz vezetne).

### Token kezelés frontenden

- A Firebase idToken-ot **nem tároljuk** — helyette a saját backendünk ad egy JWT-t
- A JWT-t `localStorage`-ban taroljuk, onnan állítjuk vissza page reloadnál
- Flow: `signInWithPopup` → `result.user.getIdToken()` → fetch `/auth/firebase` → kapunk egy JWT-t → `setToken` + `localStorage.setItem`
- Page reload: `useState(() => localStorage.getItem('mifozzek-token'))` → ha van, fetch `/api/me` → `setUser`
- JWT lejárat: 30 nap (backendben állítható)

### Firebase Admin SDK (Vercel serverless)

```js
// api/firebase.js
import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  })
}

const db = admin.firestore()
export { admin, db }
```

**Fontos:** A service account kulcsot **soha ne commitold** — env var-ban (`FIREBASE_SERVICE_ACCOUNT_KEY`) tárold JSON stringként, és Vercelben add be a környezeti változók közé.

### IdToken verifikálás

```js
const decoded = await admin.auth().verifyIdToken(idToken)
const { uid, name, picture, email } = decoded
```

**Gyakori hiba:** `verifyIdToken` dobhat `auth/argument-error`-t ha az idToken érvénytelen. Mindig try/catch.

## Vercel

### Routing

```json
{
  "rewrites": [
    { "source": "/auth/(.*)", "destination": "/api/auth" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Tanulság:** A Vite fejlesztésben a Vite proxy kezeli az átirányítást, Vercelen a `vercel.json` `rewrites`. A kettő konzisztens kell legyen.

### API könyvtár struktúra

```
api/
  auth.js     → POST /auth/firebase (token exchange)
  firebase.js → shared Firebase Admin init
  items.js    → GET/POST/DELETE /api/items
  me.js       → GET /api/me
```

**Tanulság:** Minden API fájl exportál egy `default async function handler(req, res)`-t. Vercel a fájl nevét használja útvonalként.

### Env var-ok Vercelen

| Változó | Hol kell beállítani |
|---------|---------------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Vercel Dashboard → Project Settings → Environment Variables |
| `JWT_SECRET` | Vercel + `.env` (lokálban `dev-secret`) |
| `VITE_FIREBASE_*` | `.env` fájlban (Vite automatikusan betölti) |

**Tanulság:** `VITE_` prefix nélküli env var-ok csak a backendben (API functionökben) érhetők el, a frontendben nem. A Firebase client SDK config (`apiKey`, `authDomain`, stb.) publikus, ezért VITE_ prefixes env-ekben vagy akár hardcode-olva lehet.

### Dev server in-memory store

Lokális fejlesztéshez nincs szükség Firestore-ra. Egy egyszerű `Map`-alapú store:

```js
const store = new Map()
function json(v) { try { return JSON.parse(v) } catch { return null } }

app.post('/auth/firebase', async (req, res) => {
  const token = jwt.sign({ googleId: uid }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, isNew })
})
```

**Tanulság:** A `dev-server.js`-ben minden API végpontot implementálni kell ugyanazzal a logikával, mint a Vercel API-kban. Különben a lokális tesztelés nem fedi le a production viselkedést.

## Firebase Firestore

### Adatmodell

```
users/{googleId}:
  googleId: string
  displayName: string
  email: string
  photo: string
  appetizers: [{ name, url }]
  mains: [{ name, url }]
  desserts: [{ name, url }]
```

**Tanulság:** Tömbökön belüli objektumok Firestore-ban — nincs auto-ID, a frontend generálja az adatot. Törléshez a tömb indexét vagy szűrést kell használni.

```js
// Törlés Firestore-ból
const doc = await USERS.doc(uid).get()
const items = doc.data()[field].filter(i => i.name !== name)
await USERS.doc(uid).update({ [field]: items })
```

### Új felhasználó detektálása

Az auth API visszaadhatja, hogy a user új-e:

```js
const doc = await USERS.doc(uid).get()
const isNew = !doc.exists
if (isNew) { /* create doc */ }
res.json({ token, isNew })
```

## TheMealDB API

- Random meal: `www.themealdb.com/api/json/v1/1/random.php`
- Desszert szűrés: `filter.php?c=Dessert` → visszaad egy ID listát → `lookup.php?i=<id>` a részletekért
- **Ne** loopold a `random.php`-t dessert kereséshez — a filter+lookup sokkal gyorsabb
- Fordítás: `translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hu`

## React

### `hasContent` TDZ hiba

```js
// ❌ Rossz — a const a return után van definiálva
if (page === 'foods') {
  return <div className={`app${!hasContent ? ' empty' : ''}`}>...</div>
}
const hasContent = ...

// ✅ Jó — definíció a használat előtt
const hasContent = ...
if (page === 'foods') {
  return <div className="app">...</div>  // nincs szükség hasContent-re itt
}
```

**Tanulság:** A `const` a teljes blokkban TDZ-ben van (temporal dead zone) a definíció soráig. Ha egy korai `return` után van a definíció, a `return`-ben még nem elérhető.

### SVG JSX camelCase

React JSX-ben az SVG attribútumok camelCase-t használnak:
- `stroke-width` → `strokeWidth`
- `stroke-dasharray` → `strokeDasharray`
- `stroke-linecap` → `strokeLinecap`

### State management minta

```js
const [token, setToken] = useState(() => localStorage.getItem('mifozzek-token'))

useEffect(() => {
  if (!token) { setUser(null); return }
  fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json())
    .then(data => { if (data.user) setUser(data.user) })
}, [token])
```

**Tanulság:** Az `useState` callback formája (`() => localStorage.getItem(...)`) lustán értékeli ki a kezdeti értéket — nem kell `useEffect` a localStorage olvasásához.

### Collapsible sections (csukható kategóriák)

```js
const [openSections, setOpenSections] = useState({ appetizer: false, main: false, dessert: false })

function Section({ label, count, open, onToggle, children }) {
  return (
    <div className="food-list">
      <button className="section-header" onClick={onToggle}>
        <span className="section-arrow">{open ? '▼' : '▶'}</span>
        <span className="section-label">{label} ({count})</span>
      </button>
      {open && children}
    </div>
  )
}
```

### Local storage fallback (nem bejelentkezett felhasználók)

```js
useEffect(() => {
  if (!user) localStorage.setItem('mifozzek-appetizers', JSON.stringify(appetizers))
}, [appetizers, user])
```

## CSS

### Loader spinner animáció

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
  transform-origin: center;
}
```

### Login overlay

```css
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(252, 247, 240, 0.85);
  backdrop-filter: blur(4px);
}
```

### Mobil középre rendezés

```css
@media (max-width: 480px) {
  .app-empty .header {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 0;
  }
  .app-empty .main-content {
    flex: 0;
    margin-top: auto;
  }
}
```

### Görgethető találati lista

```css
.search-results {
  overflow-y: auto;
  max-height: calc(5 * 2.75rem);
}
.search-results::-webkit-scrollbar { width: 6px; }
.search-results::-webkit-scrollbar-thumb {
  background: #d4ccc2;
  border-radius: 3px;
}
```

## Általános tanulságok

1. **In-app browser Google OAuth nem fog működni** — ne próbálkozz redirect/iframe/alternatív flow-kkal. Detektáld és irányítsd át a rendszer böngészőbe.
2. **Mindig kell dev-server** — Firestore nélküli lokális fejlesztéshez. Legyen benne ugyanaz a logika, mint a Vercel API-kban.
3. **Service account key env var** — JSON stringként tárold, `JSON.parse()` a kódban. Soha ne commitold.
4. **React SVG attribútumok camelCase** — ez tipikus hibaforrás.
5. **`useEffect` függőségek** — figyelj a closure-ökbe zárt változókra. Használj `useRef`-et ha aktuális érték kell de nem akarod hogy a hook újrafusson.
6. **Firestore tömb műveletek** — nincs `arrayRemove` összetett objektumokra, manuálisan kell filter+update.
7. **Vercel routing** — a `vercel.json` `rewrites`-e független a Vite proxy-tól. A kettőt külön kell karbantartani.
8. **Alphabetikus rendezés** — `array.sort((a, b) => a.name.localeCompare(b.name))`.
9. **Minimum spinner idő** — ha egy művelet túl gyors (pl. mentés), a spinner csak villan. Minimum 400ms késleltetés: `if (elapsed < 400) await new Promise(r => setTimeout(r, 400 - elapsed))`.
10. **`isNew` flag auth után** — érdemes a backendtől visszakapni, hogy új user-e, és arra welcome üzenetet/tour-t mutatni.
