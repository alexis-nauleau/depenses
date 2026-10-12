import { ref, computed } from 'vue'
import { apiFetch } from '../api'

const TYPE_REVENU = 'revenu'

export function useBudget(onNonAutorise) {
  // Mois et année affichés (par défaut : aujourd'hui)
  const aujourdhui = new Date()
  const annee = ref(aujourdhui.getFullYear())
  const mois = ref(aujourdhui.getMonth() + 1)

  const depenses = ref([]) // les lignes du mois affiché
  const categories = ref([])
  const report = ref(0) // solde cumulé des mois précédents
  const erreur = ref('')

  // Si on clique vite sur les flèches, une réponse ancienne ne doit pas
  // écraser une plus récente : on numérote les chargements
  let dernierChargement = 0

  async function charger() {
    erreur.value = ''
    const numero = ++dernierChargement
    const q = `annee=${annee.value}&mois=${mois.value}`
    try {
      const [resDep, resCat, resRep] = await Promise.all([
        apiFetch(`/depenses?${q}`),
        apiFetch('/categories'),
        apiFetch(`/depenses/report?${q}`),
      ])
      if (resDep.status === 401 || resCat.status === 401 || resRep.status === 401) {
        onNonAutorise?.()
        return
      }
      if (!resDep.ok || !resCat.ok || !resRep.ok) throw new Error('Erreur serveur')
      const [d, c, r] = await Promise.all([resDep.json(), resCat.json(), resRep.json()])
      if (numero !== dernierChargement) return // réponse périmée
      depenses.value = d
      categories.value = c
      report.value = r.report
    } catch (e) {
      erreur.value = 'Impossible de charger les données'
    }
  }

  // Navigation : delta = -1 (précédent) ou +1 (suivant)
  function allerMois(delta) {
    let m = mois.value + delta
    if (m < 1) {
      m = 12
      annee.value--
    } else if (m > 12) {
      m = 1
      annee.value++
    }
    mois.value = m
  }
  function changerAnnee(delta) {
    annee.value += delta
  }

  // suite = true : concerne aussi les mois suivants de la série
  async function supprimer(id, suite = false) {
    try {
      const res = await apiFetch(`/depenses/${id}${suite ? '?suite=1' : ''}`, {
        method: 'DELETE',
      })
      if (res.status === 401) return onNonAutorise?.()
      if (!res.ok) throw new Error()
      await charger()
    } catch (e) {
      erreur.value = 'Suppression impossible'
    }
  }

  async function modifier(id, data) {
    try {
      const res = await apiFetch(`/depenses/${id}`, { method: 'PUT', body: data })
      if (res.status === 401) return onNonAutorise?.()
      if (!res.ok) throw new Error()
      await charger()
    } catch (e) {
      erreur.value = 'Modification impossible'
    }
  }

  function vider() {
    depenses.value = []
    categories.value = []
    report.value = 0
    erreur.value = ''
  }

  const listeDepenses = computed(() => depenses.value.filter((d) => d.type !== TYPE_REVENU))
  const listeRevenus = computed(() => depenses.value.filter((d) => d.type === TYPE_REVENU))

  const totalDepenses = computed(() => listeDepenses.value.reduce((s, d) => s + d.montant, 0))
  const totalRevenus = computed(() => listeRevenus.value.reduce((s, d) => s + d.montant, 0))

  // Solde = ce qui a été reporté + ce mois
  const solde = computed(() => report.value + totalRevenus.value - totalDepenses.value)

  // % dépensé : calculé sur le mois seul
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
    annee, mois, categories, erreur, report,
    listeDepenses, listeRevenus, totalDepenses, totalRevenus,
    solde, pourcentDepense, parCategorie,
    charger, supprimer, modifier, vider, allerMois, changerAnnee,
  }
}