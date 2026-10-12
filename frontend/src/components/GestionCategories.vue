<script setup>
import { ref } from 'vue'
import { apiFetch } from '../api'

defineProps({ categories: Array })
const emit = defineEmits(['change'])

const nom = ref('')
const couleur = ref('#4db5ff')
const erreur = ref('')

async function creer() {
  erreur.value = ''
  if (!nom.value.trim()) {
    erreur.value = 'Donne un nom à la catégorie.'
    return
  }
  try {
    const res = await apiFetch('/categories', {
      method: 'POST',
      body: { nom: nom.value.trim(), couleur: couleur.value },
    })
    if (!res.ok) throw new Error()
    nom.value = ''
    emit('change')
  } catch (e) {
    erreur.value = 'Impossible de créer la catégorie.'
  }
}

async function supprimer(id) {
  erreur.value = ''
  try {
    const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' })
    // 409 : le backend refuse car la catégorie est encore utilisée
    if (res.status === 409) {
      erreur.value = 'Cette catégorie est encore utilisée par au moins une dépense.'
      return
    }
    if (!res.ok) throw new Error()
    emit('change')
  } catch (e) {
    erreur.value = 'Suppression impossible.'
  }
}
</script>
<template>
  <section class="panneau">
    <h2 class="titre-section">Catégories</h2>

    <!-- Formulaire de création -->
    <form class="ajout" @submit.prevent="creer">
      <input class="champ" v-model="nom" placeholder="Ex : Logement, Loisirs…" />
      <!-- type="color" : sélecteur de couleur natif du navigateur.
           Il renvoie directement une valeur du type "#4db5ff". -->
      <input v-model="couleur" type="color" title="Couleur" />
      <button class="bouton" type="submit">Créer</button>
    </form>

    <p v-if="erreur" class="erreur">{{ erreur }}</p>

    <div v-for="c in categories" :key="c.id" class="ligne">
      <!-- Pastille de la couleur de la catégorie. Le style est dynamique
           (la couleur vient de la base), donc on utilise :style -->
      <span class="pastille" :style="{ backgroundColor: c.couleur }"></span>
      <span>{{ c.nom }}</span>
      <button @click="supprimer(c.id)" title="Supprimer">✕</button>
    </div>
    <p v-if="!categories.length" class="vide">Aucune catégorie.</p>
  </section>
</template>

<style scoped>
.ajout {
  display: flex; 
  gap: 8px;
}
.ajout .champ {
  flex: 1; 
}
.ajout input[type='color'] {
  width: 44px;
  height: 40px;
  padding: 2px;
  border: 1px solid var(--bordure);
  border-radius: 6px;
  background: white;
  cursor: pointer;
}
.ligne {
  display: grid;
  grid-template-columns: 16px 1fr 28px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f1f6;
  font-size: 14px;
  color: #444;
}
.pastille {
  width: 14px;
  height: 14px;
  border-radius: 50%; 
}
.ligne button {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
}
.ligne button:hover {
  color: var(--rouge);
}
.erreur {
  margin: 10px 0 0;
  color: #c0203f;
  font-size: 13px;
}
</style>