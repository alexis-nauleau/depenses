<script setup>
import { onMounted } from 'vue'

import { useBudget } from './composables/useBudget'

import ResumeBudget from './components/ResumeBudget.vue'
import FormulaireLigne from './components/FormulaireLigne.vue'
import GestionCategories from './components/GestionCategories.vue'
import ListeLignes from './components/ListeLignes.vue'
import AnneauCategorie from './components/AnneauCategorie.vue'

// On appelle useBudget() UNE SEULE FOIS, ici. Il renvoie un objet, et on
// en extrait les morceaux dont on a besoin ("déstructuration").
const {
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
} = useBudget()


onMounted(charger)
</script>

<template>

  <header class="barre"><h1>Budget</h1></header>

  <main>
    <!-- ce paragraphe n'existe que si "erreur"  -->
    <p v-if="erreur" class="erreur">{{ erreur }}</p>

    <!-- PROPS : on envoie des données à l'enfant avec ":nom-de-la-prop".
         Les deux-points signifient "c'est une variable, pas du texte".
         Dans le template on écrit en kebab-case (pourcent-depense),
         Vue le relie au camelCase (pourcentDepense) du composant enfant. -->
    <ResumeBudget
      :pourcent-depense="pourcentDepense"
      :solde="solde"
      :total-depenses="totalDepenses"
      :total-revenus="totalRevenus"
    />

    <!-- @ajoute="charger" : quand l'enfant envoie le message "ajoute",
         on exécute la fonction charger pour rafraîchir les données -->
    <FormulaireLigne :categories="categories" @ajoute="charger" />

    <GestionCategories :categories="categories" @change="charger" />

    <!-- Quand l'enfant envoie "supprimer", il joint l'id de la ligne.
         Vue le transmet automatiquement à la fonction supprimer(id) -->
    <ListeLignes
      :revenus="listeRevenus"
      :depenses="listeDepenses"
      :total-revenus="totalRevenus"
      :total-depenses="totalDepenses"
      @supprimer="supprimer"
    />

    <!-- Grille des anneaux : un composant par catégorie utilisée.
         v-for répète le composant, :key donne un identifiant unique à chacun -->
    <section class="grille">
      <AnneauCategorie
        v-for="c in parCategorie"
        :key="c.id"
        :nom="c.nom"
        :couleur="c.couleur"
        :montant="c.montant"
        :pourcentage="c.pourcentage"
      />
    </section>
  </main>
</template>


<style scoped>
.barre {
  background: var(--bleu); 
  color: white;
  padding: 18px 24px;
}
.barre h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.grille {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}

.erreur {
  background: #ffe5ea;
  color: #c0203f;
  padding: 12px 24px;
  margin: 0;
}
</style>