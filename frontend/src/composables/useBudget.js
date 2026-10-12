import { ref, computed } from 'vue'
import { apiFetch } from '../api'

const TYPE_REVENU = 'revenu'

// onNonAutorise : fonction appelée si le serveur répond 401 (session expirée)
export function useBudget(onNonAutorise) {
  const depenses = ref([])
  const categories = ref([])
  const erreur = ref('')

  async function charger() {
    erreur.value = ''
    try {
      const [resDep, resCat] = await Promise.all([apiFetch('/depenses'), apiFetch('/categories')])
      if (resDep.status === 401 || resCat.status === 401) {
        onNonAutorise?.()
        return
      }
      if (!resDep.ok || !resCat.ok) throw new Error('Erreur serveur')
      depenses.value = await resDep.json()
      categories.value = await resCat.json()
    } catch (e) {
      erreur.value = 'Impossible de charger les données'
    }
  }

  async function supprimer(id) {
    try {
      const res = await apiFetch(`/depenses/${id}`, { method: 'DELETE' })
      if (res.status === 401) return onNonAutorise?.()
      if (!res.ok) throw new Error()
      await charger()
    } catch (e) {
      erreur.value = 'Suppression impossible'
    }
  }

  // Vide les données en mémoire (à la déconnexion), pour que le
  // prochain utilisateur sur ce navigateur ne voie jamais celles du précédent
  function vider() {
    depenses.value = []
    categories.value = []
    erreur.value = ''
  }

  const listeDepenses = computed(() => depenses.value.filter((d) => d.type !== TYPE_REVENU))
  const listeRevenus = computed(() => depenses.value.filter((d) => d.type === TYPE_REVENU))

  const totalDepenses = computed(() => listeDepenses.value.reduce((s, d) => s + d.montant, 0))
  const totalRevenus = computed(() => listeRevenus.value.reduce((s, d) => s + d.montant, 0))
  const solde = computed(() => totalRevenus.value - totalDepenses.value)

  const pourcentDepense = computed(() =>
    totalRevenus.value > 0 ? Math.round((totalDepenses.value / totalRevenus.value) * 100) : 0,
  )

  const parCategorie = computed(() =>
    categories.value
      .map((c) => {
        const montant = listeDepenses.value
          .filter((d) => d.categorieId === c.id)
          .reduce((s, d) => s + d.montant, 0)
        const pourcentage = totalRevenus.value > 0 ? (montant / totalRevenus.value) * 100 : 0
        return { ...c, montant, pourcentage }
      })
      .filter((c) => c.montant > 0),
  )

  return {
    categories,
    erreur,
    listeDepenses,
    listeRevenus,
    totalDepenses,
    totalRevenus,
    solde,
    pourcentDepense,
    parCategorie,
    charger,
    supprimer,
    vider,
  }
}