const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ----- GET /depenses : liste toutes les dépenses -----
router.get('/', async (req, res) => {
  const depenses = await prisma.depense.findMany({
    orderBy: { date: 'desc' },
    include: { categorie: true },
  })
  res.json(depenses)
})

// ----- POST /depenses : crée une nouvelle dépense -----
router.post('/', async (req, res) => {
  const { titre, montant, categorieId, type } = req.body

  const nouvelleDepense = await prisma.depense.create({
    data: {
      titre,
      montant: parseFloat(montant),
      categorieId: categorieId || null,
      type: type || 'depense',
    },
  })

  res.status(201).json(nouvelleDepense)
})

// ----- PUT /depenses/:id : modifie une dépense existante -----
router.put('/:id', async (req, res) => {
  const { titre, montant, categorieId, type } = req.body

  const depenseModifiee = await prisma.depense.update({
    where: { id: req.params.id },
    data: {
      titre,
      montant: parseFloat(montant),
      categorieId: categorieId || null,
      type,
    },
  })

  res.json(depenseModifiee)
})

// ----- DELETE /depenses/:id : supprime une dépense -----
router.delete('/:id', async (req, res) => {
  await prisma.depense.deleteMany({
    where: { id: req.params.id },
  })
  res.status(204).send()
})

module.exports = router