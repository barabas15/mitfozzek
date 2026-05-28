# Firebase Auth + Vercel repjegy

## Projektskeleton

```
api/
  firebase.js   → Firebase Admin init (JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  auth.js       → POST /auth/firebase (verifyIdToken → jwt.sign → { token, isNew })
  me.js         → GET /api/me (Bearer token → jwt.verify → user doc)
  items.js      → GET/POST/DELETE /api/items
src/
  firebase.js   → Firebase client init + export { auth, provider, signInWithPopup, onAuthStateChanged }
  App.jsx        → minden logika
vercel.json     → rewrites: /auth/* → /api/auth, /api/* → /api/$1, /* → /index.html
vite.config.js  → proxy: { '/auth': 'http://localhost:3001', '/api': 'http://localhost:3001' }
dev-server.js   → in-memory Map store, összes API endpoint
```

## Google Auth flow

```
signInWithPopup(auth, provider)
  → result.user.getIdToken()
  → POST /auth/firebase { idToken }
  → backend: verifyIdToken → jwt.sign({ googleId: uid }) → { token, isNew }
  → localStorage.setItem('mifozzek-token', data.token)
  → useEffect([token]) → GET /api/me → setUser(data.user)
```

## In-app browser

```js
const isInAppBrowser = /FBAN|FBAV|FB_IAB|FBBROWSER|Instagram|Messenger|Gmail/i.test(navigator.userAgent)
// → dialógus: "Nyisd meg böngészőben" + URL másolása
```

## Firestore adatmodell

```
users/{googleId}:
  googleId, displayName, email, photo: string
  appetizers, mains, desserts: [{ name, url }]
```

## TheMealDB

```
Random:     themealdb.com/api/json/v1/1/random.php
Dessert:    filter.php?c=Dessert → random ID → lookup.php?i=<id>
Translate:  translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hu
```

## CSS gyorsreferencia

```css
.login-overlay   → position:fixed;inset:0;z-index:1000;flex center;backdrop-filter:blur(4px)
.spin            → animation: spin 1s linear infinite
@keyframes spin  → to { transform: rotate(360deg) }
@media (max-width:480px) { .app-empty .header { flex:1; justify-content:center } ... }
```

## Häufige Fehler

| Hiba | Megoldás |
|------|----------|
| `disallowed_useragent` | In-app browser → nem lehet megkerülni |
| `stroke-width` React warning | camelCase: `strokeWidth` |
| `hasContent` TDZ error | `const` a `return` előtt legyen |
| `verifyIdToken` hiba | try/catch, lehet hogy lejárt az idToken |
| Vercel API 404 | `vercel.json` `rewrites` sorrendje fontos |
