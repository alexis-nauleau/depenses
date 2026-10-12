<script setup>
import { onMounted, watch } from 'vue'
import { useAuth } from './composables/useAuth'
import { useBudget } from './composables/useBudget'
import PageConnexion from './components/PageConnexion.vue'
import SelecteurMois from './components/SelecteurMois.vue'
import ResumeBudget from './components/ResumeBudget.vue'
import FormulaireLigne from './components/FormulaireLigne.vue'
import GestionCategories from './components/GestionCategories.vue'
import ListeLignes from './components/ListeLignes.vue'
import AnneauCategorie from './components/AnneauCategorie.vue'

//  qui est connecté ?
const { user, verifie, verifier, deconnecter } = useAuth()

// Budget : données du mois affiché + calculs.
// Si le serveur répond 401 (session expirée), on vide tout et on repasse
// en "non connecté" : la page de connexion s'affiche toute seule.
const {
  annee,
  mois,
  categories,
  erreur,
  report,
  listeDepenses,
  listeRevenus,
  totalDepenses,
  totalRevenus,
  solde,
  pourcentDepense,
  parCategorie,
  charger,
  supprimer,
  modifier,
  vider,
  allerMois,
  changerAnnee,
} = useBudget(() => {
  vider()
  user.value = null
})

// Appelée quand PageConnexion signale une connexion réussie.
// On revérifie avec /auth/me pour prouver que le cookie fonctionne vraiment.
async function apresConnexion() {
  await verifier()
  if (user.value) await charger()
}

async function seDeconnecter() {
  await deconnecter()
  vider()
}

// Au chargement de la page : suis-je déjà connecté ? Si oui, on charge le budget
onMounted(async () => {
  await verifier()
  if (user.value) await charger()
})

// Quand le mois ou l'année change, on recharge (seulement si connecté)
watch([annee, mois], () => {
  if (user.value) charger()
})
</script>

<template>

  <header class="barre">
    <h1>Budget</h1>
    <!-- cette zone n'existe que si un utilisateur est connecté -->
    <div v-if="user" class="compte">
      <span>{{ user.email }}</span>
      <button @click="seDeconnecter">Déconnexion</button>
    </div>
  </header>

  <main>

    <p v-if="!verifie" class="attente">Chargement…</p>
    <PageConnexion v-else-if="!user" @connecte="apresConnexion" />
    <template v-else>
      <p v-if="erreur" class="erreur">{{ erreur }}</p>

      <SelecteurMois :annee="annee" :mois="mois" @mois="allerMois" @annee="changerAnnee" />

      <ResumeBudget :pourcent-depense="pourcentDepense" :solde="solde" :total-depenses="totalDepenses"
        :total-revenus="totalRevenus" :report="report" />

      <FormulaireLigne :categories="categories" :annee="annee" :mois="mois" @ajoute="charger" />

      <GestionCategories :categories="categories" @change="charger" />

      <ListeLignes :revenus="listeRevenus" :depenses="listeDepenses" :total-revenus="totalRevenus"
        :total-depenses="totalDepenses" @supprimer="supprimer" @modifier="modifier" />

      <section class="grille">
        <AnneauCategorie v-for="c in parCategorie" :key="c.id" :nom="c.nom" :couleur="c.couleur" :montant="c.montant"
          :pourcentage="c.pourcentage" />
      </section>
    </template>
  </main>
</template>


<style scoped>
.barre {
  background: var(--bleu);
  color: white;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.barre h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.compte {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.compte button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.compte button:hover {
  background: rgba(255, 255, 255, 0.35);
}

.attente {
  text-align: center;
  color: var(--gris);
  padding: 24px;
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