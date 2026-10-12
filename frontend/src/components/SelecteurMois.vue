<script setup>
import { MOIS } from '../utils/format'

defineProps({ annee: Number, mois: Number })
// Le parent change le mois ou l'année : ce composant envoie juste -1 ou +1
defineEmits(['mois', 'annee'])
</script>

<template>
  <nav class="selecteur">
    <div class="groupe">
      <button @click="$emit('mois', -1)" title="Mois précédent">‹</button>
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