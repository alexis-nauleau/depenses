<script setup>
import { formatEuro } from '../utils/format'
import LigneBudget from './LigneBudget.vue'

defineProps({
  revenus: Array,
  depenses: Array,
  totalRevenus: Number,
  totalDepenses: Number,
})
defineEmits(['supprimer', 'modifier'])
</script>

<template>
  <section class="panneau">
    <h2 class="titre-section">Revenus</h2>
    <LigneBudget
      v-for="d in revenus"
      :key="d.id"
      :ligne="d"
      classe-montant="positif"
      @supprimer="(id, suite) => $emit('supprimer', id, suite)"
      @modifier="(id, data) => $emit('modifier', id, data)"
    />
    <p v-if="!revenus.length" class="vide">Aucun revenu ce mois-ci.</p>
    <div class="total">
      <span>Total revenus</span>
      <span class="positif">{{ formatEuro(totalRevenus) }}</span>
    </div>

    <h2 class="titre-section">Dépenses</h2>
    <LigneBudget
      v-for="d in depenses"
      :key="d.id"
      :ligne="d"
      @supprimer="(id, suite) => $emit('supprimer', id, suite)"
      @modifier="(id, data) => $emit('modifier', id, data)"
    />
    <p v-if="!depenses.length" class="vide">Aucune dépense ce mois-ci.</p>
    <div class="total">
      <span>Total dépenses</span>
      <span class="negatif">{{ formatEuro(totalDepenses) }}</span>
    </div>
  </section>
</template>

<style scoped>
.total {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 4px;
  font-weight: 600;
  font-size: 15px;
  color: var(--texte);
}
</style>