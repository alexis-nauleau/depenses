import { ref } from 'vue'
import { apiFetch } from '../api'

// À appeler UNE SEULE FOIS (dans App.vue), comme useBudget
export function useAuth() {
  const user = ref(null) // null = non connecté, sinon { id, email }
  const verifie = ref(false) // devient true quand /auth/me a répondu

  // Demande au backend : "suis-je connecté ?"
  async function verifier() {
    try {
      const res = await apiFetch('/auth/me')
      user.value = res.ok ? await res.json() : null
    } catch (e) {
      user.value = null
    } finally {
      verifie.value = true
    }
  }

  async function deconnecter() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (e) {
      // même si le serveur ne répond pas, on se déconnecte côté écran
    }
    user.value = null
  }

  return { user, verifie, verifier, deconnecter }
}