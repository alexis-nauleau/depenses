// Doit être la TOUTE première ligne,
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const exigerConnexion = require('./middleware/auth') // le "videur"
const authRouter = require('./routes/auth')
const depensesRouter = require('./routes/depenses')
const categoriesRouter = require('./routes/categories')

// "app" doit être créé AVANT tous les app.use
const app = express()
const PORT = 3001


// credentials: true est indispensable pour que le cookie de connexion passe.
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)

// Permet de lire le JSON envoyé par le front (req.body)
app.use(express.json())

// Si aucun JSON n'est envoyé, req.body est undefined : on le remplace par un
// objet vide pour que les routes répondent 400 au lieu de planter avec un 500
app.use((req, res, next) => {
  req.body = req.body || {}
  next()
})

// Permet de lire les cookies . Doit être AVANT les routes.
app.use(cookieParser())

// /auth reste ouvert à tous : sinon personne ne pourrait se connecter
app.use('/auth', authRouter)

// Ces deux groupes de routes passent d'abord par le videur : sans cookie
// valide, le router n'est jamais exécuté (réponse 401)
app.use('/depenses', exigerConnexion, depensesRouter)
app.use('/categories', exigerConnexion, categoriesRouter)


app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))