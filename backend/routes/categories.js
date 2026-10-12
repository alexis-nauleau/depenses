const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

const COULEUR_VALIDE = /^#[0-9a-fA-F]{6}$/ // ex : #4db5ff

// GET /categories : uniquement MES catégories
router.get('/', async (req, res) => {
  try {
    const cats = await prisma.categorie.findMany({ where: { userId: req.userId } })
    res.json(cats)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

// POST /categories : crée une catégorie qui m'appartient
router.post('/', async (req, res) => {
  const nom = String((req.body || {}).nom || '').trim()
  const couleur = String((req.body || {}).couleur || '')

  if (!nom) return res.status(400).json({ erreur: 'Nom obligatoire.' })
  if (!COULEUR_VALIDE.test(couleur)) {
    return res.status(400).json({ erreur: 'Couleur invalide.' })
  }

  try {
    const cat = await prisma.categorie.create({
      // userId vient du jeton (posé par le middleware), jamais du body
      data: { nom, couleur, userId: req.userId },
    })
    res.status(201).json(cat)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

// PUT /categories/:id : modifie une de MES catégories
router.put('/:id', async (req, res) => {
  const body = req.body || {}
  try {
    const existante = await prisma.categorie.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!existante) return res.status(404).json({ erreur: 'Catégorie introuvable.' })

    const data = {}
    if (body.nom !== undefined) {
      const nom = String(body.nom).trim()
      if (!nom) return res.status(400).json({ erreur: 'Nom obligatoire.' })
      data.nom = nom
    }
    if (body.couleur !== undefined) {
      if (!COULEUR_VALIDE.test(String(body.couleur))) {
        return res.status(400).json({ erreur: 'Couleur invalide.' })
      }
      data.couleur = body.couleur
    }

    const cat = await prisma.categorie.update({ where: { id: existante.id }, data })
    res.json(cat)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

// DELETE /categories/:id : supprime une de MES catégories
router.delete('/:id', async (req, res) => {
  try {
    // userId dans le where : si la catégorie n'est pas à moi, count = 0
    const r = await prisma.categorie.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    })
    if (r.count === 0) return res.status(404).json({ erreur: 'Catégorie introuvable.' })
    res.json({ ok: true })
  } catch (e) {
    // P2003 = catégorie encore utilisée par une dépense
    if (e.code === 'P2003') {
      return res
        .status(409)
        .json({ erreur: 'Cette catégorie est encore utilisée par au moins une dépense.' })
    }
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

module.exports = router