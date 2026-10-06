const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ----- GET /categories : liste toutes les catégories -----
router.get('/', async (req, res) => {
  const categories = await prisma.categorie.findMany()
  res.json(categories)
})

// ----- POST /categories : crée une nouvelle catégorie -----
router.post('/', async (req, res) => {
  const { nom, couleur } = req.body

  const nouvelleCategorie = await prisma.categorie.create({
    data: { nom, couleur },
  })

  res.status(201).json(nouvelleCategorie)
})

// ----- PUT /categories/:id : modifie une catégorie existante -----
router.put('/:id', async (req, res) => {
  const { nom, couleur } = req.body

  const categorieModifiee = await prisma.categorie.update({
    where: { id: req.params.id },
    data: { nom, couleur },
  })

  res.json(categorieModifiee)
})

// ----- DELETE /categories/:id : supprime une catégorie -----
router.delete('/:id', async (req, res) => {
  try {
    await prisma.categorie.delete({
      where: { id: req.params.id },
    })
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(409).json({
        message: 'Cette catégorie est encore utilisée par au moins une dépense.',
      })
    }
    throw error
  }
})

module.exports = router