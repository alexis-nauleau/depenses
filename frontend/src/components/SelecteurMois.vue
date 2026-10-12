<script setup>
import { MOIS } from '../utils/format'

// Props : le mois (1 à 12) et l'année à afficher
defineProps({ annee: Number, mois: Number })

// Ce composant ne change rien lui-même : il envoie -1 ou +1 au parent,
// qui modifie le mois ou l'année
defineEmits(['mois', 'annee'])
</script>

<template>
  <nav class="selecteur">
    <div class="groupe">
      <!-- $emit est disponible directement dans le template -->
      <button @click="$emit('mois', -1)" title="Mois précédent">‹</button>
      <!-- MOIS[mois - 1] : le mois 4 correspond à MOIS[3] = "Avril" -->
      <strong>{{ MOIS[mois - 1] }}</strong>
      <button @click="$emit('mois', 1)" title="Mois suivant">›</button>
    </div>
    <div class="groupe">
      <button @click="$emit('annee', -1)" title="Année précédente">‹</button>
      <strong>{{ annee }}</strong>
      <button @click="$emit('annee', 1)" title="Année suivante">›</button>
    </div>
  </nav>
</template>

<style scoped>
.selecteur {
  background: white;
  display: flex;
  justify-content: space-between;
  padding: 10px 24px;
  margin-bottom: 2px;
}
.groupe {
  display: flex;
  align-items: center;
  gap: 10px;
}
strong {
  min-width: 80px; 
  text-align: center;
  color: var(--texte);
  font-weight: 500;
}
button {
  background: var(--rail);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%; 
  font-size: 18px;
  cursor: pointer;
  color: var(--texte);
}
button:hover {
  background: var(--bordure);
}
</style>