// Bibliothèque qui crée et vérifie les JWT 
const jwt = require('jsonwebtoken')

// Le "videur" : une fonction exécutée AVANT une route protégée.
// Express lui donne 3 choses :
//   req  = la requête reçue (contient les cookies)
//   res  = la réponse qu'on pourra renvoyer
//   next = la fonction qui dit "c'est bon,"
// Tout le code qui utilise req DOIT être à l'intérieur de cette fonction.
function exigerConnexion(req, res, next) {
  // 1. On lit le cookie "token" 
  const token = req.cookies.token

  // 2. Pas de cookie   = on refuse (401 = non autorisé)
  if (!token) return res.status(401).json({ erreur: 'Non connecté.' })

  try {
    // 3. On vérifie la signature avec JWT_SECRET.
    //    Si le jeton est falsifié ou expiré, jwt.verify lance une erreur
    //    et on tombe dans le catch.
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // 4. On note qui c'est : les routes suivantes liront req.userId
    req.userId = payload.userId

    // 5. On laisse passer vers la route demandée
    next()
  } catch (e) {
    return res.status(401).json({ erreur: 'Session invalide ou expirée.' })
  }
}

module.exports = exigerConnexion