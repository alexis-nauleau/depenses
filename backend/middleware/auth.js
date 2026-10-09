//comme un videur
const token = req.cookies.token          // je lis le bracelet
const payload = jwt.verify(token, secret) // je vérifie qu'il est authentique
req.userId = payload.userId               // je note qui c'est
next()                                    // je laisse passer