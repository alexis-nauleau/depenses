const express = require('express')

const exigerConnexion = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

const DUREE_JOURS = 7

// POST /auth/register
router.post('/register', async (req, res) => {
  // 1. On récupère ce que l'utilisateur a envoyé
  const email = String(req.body.email || '').trim().toLowerCase()
  const motDePasse = String(req.body.motDePasse || '')

  // 2. On refuse les données invalides
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ erreur: 'Email invalide.' })
  }
  if (motDePasse.length < 8) {
    return res.status(400).json({ erreur: 'Mot de passe : 8 caractères minimum.' })
  }

  try {
    // 3. On brouille le mot de passe (jamais stocké en clair)
    const hash = await bcrypt.hash(motDePasse, 10)

    // 4. On crée l'utilisateur en base
    const user = await prisma.user.create({ data: { email, motDePasse: hash } })

    // 5. On fabrique le bracelet (JWT) et on le dépose dans un cookie
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: `${DUREE_JOURS}d`,
    })
    res.cookie('token', token, {
      httpOnly: true, // illisible par JavaScript
      sameSite: 'lax',
      maxAge: DUREE_JOURS * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({ id: user.id, email: user.email })
  } catch (e) {
    // P2002 = l'email existe déjà (contrainte @unique)
    if (e.code === 'P2002') {
      return res.status(409).json({ erreur: 'Un compte existe déjà avec cet email.' })
    }
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})
// POST /auth/login
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const motDePasse = String(req.body.motDePasse || '')

  try {
    // 1. On cherche l'utilisateur par son email
    const user = await prisma.user.findUnique({ where: { email } })

    // 2. On compare le mot de passe tapé avec la version brouillée en base
    const valide = user && (await bcrypt.compare(motDePasse, user.motDePasse))

    // Même message si l'email n'existe pas OU si le mot de passe est faux :
    // on ne révèle pas quels emails ont un compte
    if (!valide) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' })
    }

    // 3. Même fabrication du bracelet que pour register
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: `${DUREE_JOURS}d`,
    })
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: DUREE_JOURS * 24 * 60 * 60 * 1000,
    })

    res.json({ id: user.id, email: user.email })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})
// POST /auth/logout : on retire le bracelet
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

// GET /auth/me : renvoie l'utilisateur connecté
router.get('/me', exigerConnexion, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    })
    if (!user) return res.status(401).json({ erreur: 'Compte introuvable.' })
    res.json(user)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erreur: 'Erreur serveur.' })
  }
})

module.exports = router