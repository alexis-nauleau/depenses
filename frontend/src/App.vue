<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { useBudget } from './composables/useBudget'
import PageConnexion from './components/PageConnexion.vue'
import ResumeBudget from './components/ResumeBudget.vue'
import FormulaireLigne from './components/FormulaireLigne.vue'
import GestionCategories from './components/GestionCategories.vue'
import ListeLignes from './components/ListeLignes.vue'
import AnneauCategorie from './components/AnneauCategorie.vue'

const { user, verifie, verifier, deconnecter } = useAuth()

// Si le serveur répond 401 pendant qu'on utilise l'appli (session expirée),
// on repasse en "non connecté" : la page de connexion s'affiche toute seule
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
  vider,
} = useBudget(() => {
  vider()
  user.value = null
})

async function apresConnexion() {
  await verifier() // rappelle /auth/me : prouve que le cookie est bien renvoyé
  if (user.value) await charger()
}

async function seDeconnecter() {
  await deconnecter()
  vider()
}

// Au chargement : suis-je déjà connecté ? Si oui, on charge le budget
onMounted(async () => {
  await verifier()
  if (user.value) await charger()
})
</script>

<template>
  <header class="barre">
    <h1>Budget</h1>
    <div v-if="user" class="compte">
      <span>{{ user.email }}</span>
      <button @click="seDeconnecter">Déconnexion</button>
    </div>
  </header>

  <main>
    <!-- 1. On attend la réponse de /auth/me (évite d'afficher la connexion une fraction de seconde) -->
    <p v-if="!verifie" class="attente">Chargement…</p>

    <!-- 2. Non connecté -->
    <PageConnexion v-else-if="!user" @connecte="apresConnexion" />

    <!-- 3. Connecté : le budget -->
    <template v-else>
      <p v-if="erreur" class="erreur">{{ erreur }}</p>

      <ResumeBudget
        :pourcent-depense="pourcentDepense"
        :solde="solde"
        :total-depenses="totalDepenses"
        :total-revenus="totalRevenus"
      />

      <FormulaireLigne :categories="categories" @ajoute="charger" />

      <GestionCategories :categories="categories" @change="charger" />

      <ListeLignes
        :revenus="listeRevenus"
        :depenses="listeDepenses"
        :total-revenus="totalRevenus"
        :total-depenses="totalDepenses"
        @supprimer="supprimer"
      />

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