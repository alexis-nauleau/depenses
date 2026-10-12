require('dotenv').config() // toute première ligne

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const exigerConnexion = require('./middleware/auth') // le videur
const authRouter = require('./routes/auth')
const depensesRouter = require('./routes/depenses')
const categoriesRouter = require('./routes/categories')

const app = express() // "app" doit être créé AVANT tous les app.use
const PORT = 3001

// Autorise le front (port 5173) à envoyer le cookie au back (port 3001)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser()) // permet de lire req.cookies

// /auth reste ouvert : sinon personne ne pourrait se connecter
app.use('/auth', authRouter)

// Ces deux routes passent par le videur avant d'arriver au router
app.use('/depenses', exigerConnexion, depensesRouter)
app.use('/categories', exigerConnexion, categoriesRouter)

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))