// Express : le framework qui gère les routes et requêtes HTTP
const express = require('express')

const cors = require('cors')

// Le client Prisma généré, pour parler à la base de données
const { PrismaClient } = require('@prisma/client')

const app = express()
app.use(cors())
const prisma = new PrismaClient()
const PORT = 3001

// Middleware : permet à Express de comprendre le JSON envoyé
// dans le corps des requêtes POST/PUT (sans ça, req.body serait vide)
app.use(express.json())

// ----- GET /depenses : liste toutes les dépenses -----
app.get('/depenses', async (req, res) => {
  const depenses = await prisma.depense.findMany({
    orderBy: { date: 'desc' },
  })
  res.json(depenses)
})

// ----- POST /depenses : crée une nouvelle dépense -----
app.post('/depenses', async (req, res) => {
  const { titre, montant, categorie } = req.body

  const nouvelleDepense = await prisma.depense.create({
    data: {
      titre,
      montant: parseFloat(montant),
      categorie,
      type: type || 'depense', // si rien n'est précisé, c'est une dépense par défaut
    },
  })

  // 201 = "Created", le code HTTP correct pour une création réussie
  res.status(201).json(nouvelleDepense)
})

// ----- DELETE /depenses/:id : supprime une dépense -----
// ":id" est un paramètre dynamique dans l'URL, récupéré via req.params.id
app.delete('/depenses/:id', async (req, res) => {
  await prisma.depense.deleteMany({
    where: { id: req.params.id },
  })

  // 204 = "No Content", standard pour une suppression réussie sans rien à renvoyer
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})