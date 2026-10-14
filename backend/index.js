require('dotenv').config() // toute première ligne

const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const exigerConnexion = require('./middleware/auth')
const authRouter = require('./routes/auth')
const depensesRouter = require('./routes/depenses')
const categoriesRouter = require('./routes/categories')

const app = express()
const PORT = process.env.PORT || 3001 // l'hébergeur impose son propre port
const PRODUCTION = process.env.NODE_ENV === 'production'

// Derrière le proxy de l'hébergeur (qui fournit le HTTPS) : sans cette ligne,
// Express croit être en HTTP et refuse d'envoyer un cookie "secure"
if (PRODUCTION) app.set('trust proxy', 1)

// En-têtes de sécurité HTTP. La politique de contenu est désactivée pour
// l'instant : elle bloquerait les styles inline de Vue (on la réglera plus tard).
app.use(helmet({ contentSecurityPolicy: false }))

// CORS : seulement utile en développement (front 5173, back 3001).
// En production, tout est sur la même adresse, donc pas besoin.
if (!PRODUCTION) {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
}

app.use(express.json())
app.use((req, res, next) => {
  req.body = req.body || {}
  next()
})
app.use(cookieParser())

// Routes de l'API
app.use('/auth', authRouter)
app.use('/depenses', exigerConnexion, depensesRouter)
app.use('/categories', exigerConnexion, categoriesRouter)

// En production, Express sert aussi le front construit (dossier dist)
if (PRODUCTION) {
  const dist = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(dist))
  // Toute autre adresse renvoie index.html (l'appli Vue prend le relais)
  app.use((req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`))