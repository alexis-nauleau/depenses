<script setup>
import { ref } from 'vue'
import { apiFetch } from '../api'

// Message envoyé au parent (App.vue) quand la connexion ou l'inscription réussit
const emit = defineEmits(['connecte'])

const mode = ref('login') // 'login' ou 'register'
const email = ref('')
const motDePasse = ref('')
const erreur = ref('')
const enCours = ref(false) // true pendant l'envoi : évite le double clic

async function envoyer() {
  erreur.value = ''
  enCours.value = true
  try {
    // mode vaut 'login' ou 'register' : ça donne /auth/login ou /auth/register
    const res = await apiFetch(`/auth/${mode.value}`, {
      method: 'POST',
      body: { email: email.value, motDePasse: motDePasse.value },
    })
    // .catch(() => ({})) : si la réponse n'est pas du JSON, on évite un plantage
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      erreur.value = data.erreur || 'Une erreur est survenue.'
      return
    }
    motDePasse.value = '' // on ne garde pas le mot de passe en mémoire
    emit('connecte', data) // data = { id, email }
  } catch (e) {
    erreur.value = 'Serveur injoignable.'
  } finally {
    enCours.value = false // s'exécute dans tous les cas (même après le return)
  }
}


function changerMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  erreur.value = ''
}
</script>

<template>
  <!-- @submit.prevent : à l'envoi on appelle envoyer(), et ".prevent"
       empêche le navigateur de recharger la page -->
  <form class="panneau connexion" @submit.prevent="envoyer">
    <h2 class="titre-section">{{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}</h2>

    <!-- v-model : lie le champ à la variable dans les deux sens.
         autocomplete aide le gestionnaire de mots de passe du navigateur. -->
    <input
      class="champ"
      v-model="email"
      type="email"
      placeholder="Email"
      autocomplete="email"
      required
    />
    <input
      class="champ"
      v-model="motDePasse"
      type="password"
      placeholder="Mot de passe (8 caractères minimum)"
      :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
      required
    />

    <!-- :disabled grise le bouton pendant l'envoi -->
    <button class="bouton" type="submit" :disabled="enCours">
      {{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}
    </button>

    <p v-if="erreur" class="erreur">{{ erreur }}</p>

    <!-- type="button" : ce bouton ne doit PAS envoyer le formulaire -->
    <button type="button" class="lien" @click="changerMode">
      {{ mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
    </button>
  </form>
</template>

<style scoped>
.connexion {
  display: flex;
  flex-direction: column; 
  gap: 10px;
  padding: 20px 24px;
}
.erreur {
  margin: 0;
  color: #c0203f;
  font-size: 13px;
}

.lien {
  background: none;
  border: none;
  color: var(--bleu-fonce);
  cursor: pointer;
  font-size: 13px;
}
</style>