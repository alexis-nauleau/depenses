require('dotenv').config() 
const express = require('express')
const cors = require('cors')
const authRouter = require('./routes/auth')
const depensesRouter = require('./routes/depenses')
const categoriesRouter = require('./routes/categories')
const cookieParser = require('cookie-parser')
const app = express()
const PORT = 3001

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser()) // permet de lire req.cookies

app.use('/auth', authRouter)
app.use('/depenses', depensesRouter)
app.use('/categories', categoriesRouter)

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))