const express = require('express')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

const TYPES_VALIDES = ['depense', 'revenu']

// Le 1er du mois à midi UTC : évite qu'un décalage de fuseau
// fasse tomber la ligne dans le mois précédent
function dateDuMois(annee, mois) {
  return new Date(Date.UTC(annee, mois - 1, 1, 12))
}

// Intervalle [début du mois, début du mois suivant[
function bornesMois(annee, mois) {
  return { gte: new Date(Date.UTC(annee, mois - 1, 1)), lt: new Date(Date.UTC(annee, mois, 1)) }
}
function bornesAnnee(annee) {
  return { gte: new Date(Date.UTC(annee, 0, 1)), lt: new Date(Date.UTC(annee + 1, 0, 1)) }
}

const anneeValide = (a) => Number.isInteger(a) && a >= 2000 && a <= 2100
const moisValide = (m) => Number.isInteger(m) && m >= 1 && m <= 12

async function categorieEstAMoi(categorieId, userId) {
  const c = await prisma.categorie.findFirst({ where: { id: categorieId, userId } })
  return Boolean(c)
}

// GET /depenses?annee=2026&mois=4 : mes lignes d'un mois (mois facultatif : toute l'année)
router.get('/', async (req, res) => {
  const where = { userId: req.userId }
  if (req.query.annee !== undefined) {
    const annee = Number(req.query.annee)
    if (!anneeValide(annee)) return res.status(400).json({ erreur: 'Année invalide.' })
    if (req.query.mois !== undefined) {
      const mois = Number(req.query.mois)
      if (!moisValide(mois)) return res.status(400).json({ erreur: 'Mois invalide.' })
      where.date = bornesMois(annee, mois)
    } else {
      where.date = bornesAnnee(annee)
    }
  }
  try {
    const lignes = await prisma.depense.findMany({ where, orderBy: { date: 'asc' } })
    res.json(lignes)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})
// GET /depenses/report?annee=2026&mois=4 : solde cumulé de TOUT ce qui précède ce mois
router.get('/report', async (req, res) => {
  const annee = Number(req.query.annee)
  const mois = Number(req.query.mois)
  if (!anneeValide(annee) || !moisValide(mois)) {
    return res.status(400).json({ erreur: 'Année ou mois invalide.' })
  }
  try {
    const debut = new Date(Date.UTC(annee, mois - 1, 1))
    const groupes = await prisma.depense.groupBy({
      by: ['type'],
      where: { userId: req.userId, date: { lt: debut } },
      _sum: { montant: true },
    })
    let report = 0
    for (const g of groupes) {
      const somme = g._sum.montant || 0
      report += g.type === 'revenu' ? somme : -somme
    }
    res.json({ report: Math.round(report * 100) / 100 })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

// POST /depenses : crée une ligne, ou une ligne par mois cochés (liées par un serieId)
// Body : { titre, montant, type, categorieId, annee, mois: [1, 2, 3...] }
router.post('/', async (req, res) => {
  const body = req.body || {}
  const titre = String(body.titre || '').trim()
  const montant = Number(body.montant)
  const type = body.type || 'depense'
  const categorieId = body.categorieId || null

  if (!titre) return res.status(400).json({ erreur: 'Titre obligatoire.' })
  if (!Number.isFinite(montant) || montant <= 0) {
    return res.status(400).json({ erreur: 'Montant invalide.' })
  }
  if (!TYPES_VALIDES.includes(type)) return res.status(400).json({ erreur: 'Type invalide.' })

  // Liste des dates à créer
  let dates
  if (body.annee === undefined && body.mois === undefined) {
    dates = [new Date()] // ancien comportement : une ligne, aujourd'hui
  } else {
    const annee = Number(body.annee)
    const mois = Array.isArray(body.mois) ? [...new Set(body.mois.map(Number))] : []
    if (!anneeValide(annee)) return res.status(400).json({ erreur: 'Année invalide.' })
    if (mois.length === 0 || !mois.every(moisValide)) {
      return res.status(400).json({ erreur: 'Choisis au moins un mois valide.' })
    }
    dates = mois.sort((a, b) => a - b).map((m) => dateDuMois(annee, m))
  }

  try {
    if (categorieId && !(await categorieEstAMoi(categorieId, req.userId))) {
      return res.status(400).json({ erreur: 'Catégorie invalide.' })
    }
    // Plusieurs mois = une série. Un seul mois = ligne ponctuelle.
    const serieId = dates.length > 1 ? crypto.randomUUID() : null
    const r = await prisma.depense.createMany({
      data: dates.map((date) => ({
        titre,
        montant,
        type,
        categorieId,
        date,
        serieId,
        userId: req.userId, // vient du jeton, jamais du body
      })),
    })
    res.status(201).json({ crees: r.count })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

// PUT /depenses/:id : modifie une ligne.
// Avec { suite: true } : modifie aussi les lignes SUIVANTES de la même série.
router.put('/:id', async (req, res) => {
  const body = req.body || {}
  try {
    const existante = await prisma.depense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!existante) return res.status(404).json({ erreur: 'Ligne introuvable.' })

    const data = {}
    if (body.titre !== undefined) {
      const titre = String(body.titre).trim()
      if (!titre) return res.status(400).json({ erreur: 'Titre obligatoire.' })
      data.titre = titre
    }
    if (body.montant !== undefined) {
      const montant = Number(body.montant)
      if (!Number.isFinite(montant) || montant <= 0) {
        return res.status(400).json({ erreur: 'Montant invalide.' })
      }
      data.montant = montant
    }
    if (body.type !== undefined) {
      if (!TYPES_VALIDES.includes(body.type)) {
        return res.status(400).json({ erreur: 'Type invalide.' })
      }
      data.type = body.type
    }
    if (body.categorieId !== undefined) {
      const cid = body.categorieId || null
      if (cid && !(await categorieEstAMoi(cid, req.userId))) {
        return res.status(400).json({ erreur: 'Catégorie invalide.' })
      }
      data.categorieId = cid
    }

    if (body.suite === true && existante.serieId) {
      // Ce mois ET les suivants, dans la même série, et toujours MES lignes
      const r = await prisma.depense.updateMany({
        where: {
          userId: req.userId,
          serieId: existante.serieId,
          date: { gte: existante.date },
        },
        data,
      })
      return res.json({ modifiees: r.count })
    }

    await prisma.depense.update({ where: { id: existante.id }, data })
    res.json({ modifiees: 1 })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

// DELETE /depenses/:id?suite=1 : supprime la ligne (et les suivantes de la série si suite=1)
router.delete('/:id', async (req, res) => {
  try {
    const existante = await prisma.depense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!existante) return res.status(404).json({ erreur: 'Ligne introuvable.' })

    if (req.query.suite === '1' && existante.serieId) {
      const r = await prisma.depense.deleteMany({
        where: {
          userId: req.userId,
          serieId: existante.serieId,
          date: { gte: existante.date },
        },
      })
      return res.json({ supprimees: r.count })
    }

    await prisma.depense.deleteMany({ where: { id: existante.id, userId: req.userId } })
    res.json({ supprimees: 1 })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

module.exports = router