import { ref } from 'vue'
import { apiFetch } from '../api'

// Un composable = une fonction qui regroupe des données et leur logique.
// À appeler UNE SEULE FOIS (dans App.vue) : chaque appel crée ses propres données.
export function useAuth() {
  const user = ref(null) // null = non connecté, sinon { id, email }
  const verifie = ref(false) // devient true quand /auth/me a répondu

  // Demande au backend : "suis-je connecté ?" (le cookie part automatiquement)
  async function verifier() {
    try {
      const res = await apiFetch('/auth/me')
      // 200 : on garde l'utilisateur. Sinon (401) : non connecté.
      user.value = res.ok ? await res.json() : null
    } catch (e) {
      user.value = null // serveur injoignable
    } finally {
      verifie.value = true // s'exécute dans tous les cas
    }
  }

  async function deconnecter() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }) // le backend supprime le cookie
    } catch (e) {
      // même si le serveur ne répond pas, on se déconnecte côté écran
    }
    user.value = null
  }

  return { user, verifie, verifier, deconnecter }
}