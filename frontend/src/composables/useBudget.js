// ref : variable réactive (l'écran se met à jour quand elle change)
// computed : valeur calculée automatiquement à partir d'autres variables
import { ref, computed } from 'vue'


import { API } from '../api'

// Valeur du champ "type" en base pour un revenu
const TYPE_REVENU = 'revenu'

// Un COMPOSABLE 
export function useBudget() {

  // Toutes les lignes venant de la base (revenus ET dépenses mélangés).
  const depenses = ref([])

  const categories = ref([])

  // Message d'erreur à afficher (vide = pas d'erreur)
  const erreur = ref('')

  // Récupère les dépenses et les catégories
  async function charger() {
    erreur.value = '' // on efface l'ancienne erreur avant de réessayer
    try {
      // Promise.all lance les 2 requêtes en même temps 

      const [resDep, resCat] = await Promise.all([
        fetch(`${API}/depenses`),
        fetch(`${API}/categories`),
      ])

      // res.ok vaut false si le serveur répond par une erreur (404, 500...)
      if (!resDep.ok || !resCat.ok) throw new Error('Erreur serveur')

      // .json() transforme la réponse en tableau JavaScript
      depenses.value = await resDep.json()
      categories.value = await resCat.json()
    } catch (e) {
     
      erreur.value = 'Impossible de charger les données'
    }
  }


  async function supprimer(id) {
    try {
      const res = await fetch(`${API}/depenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await charger()
    } catch (e) {
      erreur.value = 'Suppression impossible'
    }
  }

  // ============================================================
  // VALEURS CALCULÉES 
  // ============================================================


  // Dépenses : tout ce qui n'est PAS un revenu. Revenus : le reste.
  const listeDepenses = computed(() => depenses.value.filter((d) => d.type !== TYPE_REVENU))
  const listeRevenus = computed(() => depenses.value.filter((d) => d.type === TYPE_REVENU))

  // .reduce() . Le 0 est la valeur de départ,
  // "s" est la somme en cours, "d" la ligne examinée.
  const totalDepenses = computed(() => listeDepenses.value.reduce((s, d) => s + d.montant, 0))
  const totalRevenus = computed(() => listeRevenus.value.reduce((s, d) => s + d.montant, 0))


  const solde = computed(() => totalRevenus.value - totalDepenses.value)

  // Part des revenus déjà dépensée, en %.
  // "condition ? valeurSiVrai : valeurSiFaux" est un if condensé.
  // Le test > 0 évite une division par zéro quand aucun revenu n'est saisi.
  const pourcentDepense = computed(() =>
    totalRevenus.value > 0 ? Math.round((totalDepenses.value / totalRevenus.value) * 100) : 0,
  )

  // Pour chaque catégorie : total dépensé et % du budget (= des revenus)
  const parCategorie = computed(() =>
    categories.value
      // .map() transforme chaque catégorie en un objet enrichi
      .map((c) => {
    
        const montant = listeDepenses.value
          .filter((d) => d.categorieId === c.id)
          .reduce((s, d) => s + d.montant, 0)

        const pourcentage = totalRevenus.value > 0 ? (montant / totalRevenus.value) * 100 : 0

        // { ...c } copie la catégorie, puis on lui ajoute montant et pourcentage
        return { ...c, montant, pourcentage }
      })
      // On cache les catégories sans aucune dépense
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
  }
}