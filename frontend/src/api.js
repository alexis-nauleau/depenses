// En développement (npm run dev) : le backend est sur le port 3001.
// En production : le front et l'API sont sur la même adresse, donc adresse relative.
export const API = import.meta.env.DEV ? 'http://localhost:3001' : ''

// Remplace fetch dans toute l'appli.
// - credentials: 'include' : le navigateur envoie le cookie de connexion
// - body : on passe un objet JS, la fonction le transforme en JSON
export function apiFetch(chemin, options = {}) {
  const { body, headers, ...reste } = options
  return fetch(`${API}${chemin}`, {
    credentials: 'include',
    ...reste,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
}