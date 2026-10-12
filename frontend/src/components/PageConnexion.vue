<script setup>
import { ref } from 'vue'
import { apiFetch } from '../api'

// Message envoyé au parent quand la connexion ou l'inscription réussit
const emit = defineEmits(['connecte'])

const mode = ref('login') // 'login' ou 'register'
const email = ref('')
const motDePasse = ref('')
const erreur = ref('')
const enCours = ref(false) // évite le double clic

async function envoyer() {
  erreur.value = ''
  enCours.value = true
  try {
    // mode vaut 'login' ou 'register' : ça donne /auth/login ou /auth/register
    const res = await apiFetch(`/auth/${mode.value}`, {
      method: 'POST',
      body: { email: email.value, motDePasse: motDePasse.value },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      erreur.value = data.erreur || 'Une erreur est survenue.'
      return
    }
    motDePasse.value = '' // on n'garde pas le mot de passe en mémoire
    emit('connecte', data) // data = { id, email }
  } catch (e) {
    erreur.value = 'Serveur injoignable.'
  } finally {
    enCours.value = false
  }
}

function changerMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  erreur.value = ''
}
</script>

<template>
  <form class="panneau connexion" @submit.prevent="envoyer">
    <h2 class="titre-section">{{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}</h2>

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

    <button class="bouton" type="submit" :disabled="enCours">
      {{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}
    </button>

    <p v-if="erreur" class="erreur">{{ erreur }}</p>

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