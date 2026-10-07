<script setup>
import { formatEuro } from '../utils/format'

// PROPS : les listes et totaux envoyés par App.vue
defineProps({
  revenus: Array,
  depenses: Array,
  totalRevenus: Number,
  totalDepenses: Number,
})

// EMITS :  Il prévient le parent avec le message "supprimer".
defineEmits(['supprimer'])
</script>

<template>

  <section class="panneau">
    <h2 class="titre-section">Revenus</h2>

  
    <div v-for="d in revenus" :key="d.id" class="ligne">
      <span>{{ d.titre }}</span>
      <span class="positif">{{ formatEuro(d.montant) }}</span>
      <!-- $emit('supprimer', d.id) envoie le message au parent avec l'id. -->
      <button @click="$emit('supprimer', d.id)" title="Supprimer">✕</button>
    </div>

    <!-- !revenus.length est vrai quand le tableau est vide (longueur 0) -->
    <p v-if="!revenus.length" class="vide">Aucun revenu saisi.</p>

    <div class="total">
      <span>Total revenus</span>
      <span class="positif">{{ formatEuro(totalRevenus) }}</span>
    </div>

    <h2 class="titre-section">Dépenses</h2>
    <div v-for="d in depenses" :key="d.id" class="ligne">
      <span>{{ d.titre }}</span>
      <span>{{ formatEuro(d.montant) }}</span>
      <button @click="$emit('supprimer', d.id)" title="Supprimer">✕</button>
    </div>
    <p v-if="!depenses.length" class="vide">Aucune dépense saisie.</p>
    <div class="total">
      <span>Total dépenses</span>
      <span class="negatif">{{ formatEuro(totalDepenses) }}</span>
    </div>
  </section>
</template>

<style scoped>
.ligne {
  display: grid;
  grid-template-columns: 1fr auto 28px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f1f6;
  font-size: 14px;
  color: #444;
}
.ligne button {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
}
.ligne button:hover {
  color: var(--rouge); }
.total {
  display: flex;
  justify-content: space-between; 
  padding: 12px 0 4px;
  font-weight: 600;
  font-size: 15px;
  color: var(--texte);
}
</style>