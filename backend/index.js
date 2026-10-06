const express = require('express')
const cors = require('cors')

const depensesRouter = require('./routes/depenses')
const categoriesRouter = require('./routes/categories')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Toute requête commençant par /depenses est déléguée à depensesRouter,
// qui gère ensuite les sous-chemins (/, /:id) en interne
app.use('/depenses', depensesRouter)
app.use('/categories', categoriesRouter)

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})