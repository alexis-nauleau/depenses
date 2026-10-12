import { ref, computed } from 'vue'
import { apiFetch } from '../api'


const TYPE_REVENU = 'revenu'

// onNonAutorise : fonction fournie par App.vue, appelée si le serveur répond

export function useBudget(onNonAutorise) {

  const aujourdhui = new Date()
  const annee = ref(aujourdhui.getFullYear())
  const mois = ref(aujourdhui.getMonth() + 1)

  const depenses = ref([]) 
  const categories = ref([])
  const report = ref(0) 
  const erreur = ref('')

  // Si on clique vite sur les flèches, une réponse ancienne ne doit pas
  // écraser une plus récente : on numérote chaque chargement.
  let dernierChargement = 0

  // ============================================================
  // APPELS AU BACKEND
  // ============================================================

  async function charger() {
    erreur.value = ''
    const numero = ++dernierChargement
    const q = `annee=${annee.value}&mois=${mois.value}`
    try {
      // Trois requêtes lancées en même temps (plus rapide)
      const [resDep, resCat, resRep] = await Promise.all([
        apiFetch(`/depenses?${q}`),
        apiFetch('/categories'),
        apiFetch(`/depenses/report?${q}`),
      ])
      if (resDep.status === 401 || resCat.status === 401 || resRep.status === 401) {
        onNonAutorise?.() // "?." = appelle la fonction seulement si elle existe
        return
      }
      if (!resDep.ok || !resCat.ok || !resRep.ok) throw new Error('Erreur serveur')

      const [d, c, r] = await Promise.all([resDep.json(), resCat.json(), resRep.json()])

      // Si un chargement plus récent a été lancé entre-temps, on jette celui-ci
      if (numero !== dernierChargement) return

      depenses.value = d
      categories.value = c
      report.value = r.report
    } catch (e) {
      erreur.value = 'Impossible de charger les données'
    }
  }

  // Navigation entre les mois : delta vaut -1 (précédent) ou +1 (suivant)
  function allerMois(delta) {
    let m = mois.value + delta
    if (m < 1) {
      m = 12 // avant janvier : décembre de l'année précédente
      annee.value--
    } else if (m > 12) {
      m = 1 // après décembre : janvier de l'année suivante
      annee.value++
    }
    mois.value = m
  }

  function changerAnnee(delta) {
    annee.value += delta
  }

  // suite = true : supprime aussi les mois suivants de la série
  async function supprimer(id, suite = false) {
    try {
      const res = await apiFetch(`/depenses/${id}${suite ? '?suite=1' : ''}`, {
        method: 'DELETE',
      })
      if (res.status === 401) return onNonAutorise?.()
      if (!res.ok) throw new Error()
      await charger() // on recharge pour que l'écran soit à jour
    } catch (e) {
      erreur.value = 'Suppression impossible'
    }
  }

  // data contient les champs à modifier, et suite: true/false
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

  // Vide les données en mémoire (à la déconnexion), pour que le prochain
  // utilisateur sur ce navigateur ne voie jamais celles du précédent
  function vider() {
    depenses.value = []
    categories.value = []
    report.value = 0
    erreur.value = ''
  }

  // ============================================================
  // VALEURS CALCULÉES (elles se recalculent toutes seules)
  // ============================================================

  // .filter() garde les éléments qui respectent la condition
  const listeDepenses = computed(() => depenses.value.filter((d) => d.type !== TYPE_REVENU))
  const listeRevenus = computed(() => depenses.value.filter((d) => d.type === TYPE_REVENU))

  // .reduce() additionne les montants (s = somme en cours, 0 = valeur de départ)
  const totalDepenses = computed(() => listeDepenses.value.reduce((s, d) => s + d.montant, 0))
  const totalRevenus = computed(() => listeRevenus.value.reduce((s, d) => s + d.montant, 0))

  // Solde = ce qui a été reporté + les revenus du mois - les dépenses du mois
  const solde = computed(() => report.value + totalRevenus.value - totalDepenses.value)

  // % dépensé : calculé sur le mois seul (pas sur le report).
  // Le test > 0 évite une division par zéro.
  const pourcentDepense = computed(() =>
    totalRevenus.value > 0 ? Math.round((totalDepenses.value / totalRevenus.value) * 100) : 0,
  )

  // Pour chaque catégorie : total dépensé et % du budget (= revenus du mois)
  const parCategorie = computed(() =>
    categories.value
      .map((c) => {
        const montant = listeDepenses.value
          .filter((d) => d.categorieId === c.id)
          .reduce((s, d) => s + d.montant, 0)
        const pourcentage = totalRevenus.value > 0 ? (montant / totalRevenus.value) * 100 : 0
        // { ...c } copie la catégorie, puis on lui ajoute montant et pourcentage
        return { ...c, montant, pourcentage }
      })
      .filter((c) => c.montant > 0) // on cache les catégories sans dépense ce mois-ci
  )

  // Seul ce qui est dans ce return est accessible de l'extérieur
  return {
    annee, mois, categories, erreur, report,
    listeDepenses, listeRevenus, totalDepenses, totalRevenus,
    solde, pourcentDepense, parCategorie,
    charger, supprimer, modifier, vider, allerMois, changerAnnee,
  }
}