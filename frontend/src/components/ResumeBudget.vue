<script setup>
import { formatEuro } from '../utils/format'

// PROPS : ce composant ne calcule rien, il REÇOIT ses données du parent
// et ne fait que les afficher.
defineProps({
  pourcentDepense: Number,
  solde: Number,
  totalDepenses: Number,
  totalRevenus: Number,
})
</script>

<template>
  <section class="resume">
    <!-- Bloc de gauche : pourcentage dépensé et jauge -->
    <div class="bloc">
   
      <strong>{{ pourcentDepense }} %</strong>
      <span>DÉPENSÉ CE MOIS-CI</span>
      <div class="jauge">
        <!-- Math.min(..., 100) empêche la barre de dépasser son rail -->
        <div class="jauge-remplie" :style="{ width: Math.min(pourcentDepense, 100) + '%' }"></div>
      </div>
    </div>

    <div class="bloc">
      <!-- :class choisit la classe selon la condition : vert si >= 0, sinon rouge -->
      <strong :class="solde >= 0 ? 'positif' : 'negatif'">{{ formatEuro(solde) }}</strong>
      <span>SOLDE COURANT</span>
    </div>
  </section>

  <p class="phrase">
    Vous avez dépensé <b>{{ formatEuro(totalDepenses) }}</b> pour
    <b>{{ formatEuro(totalRevenus) }}</b> de revenus.
  </p>
</template>

<style scoped>
.resume {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 2px;
}
.bloc {
  background: white;
  padding: 24px 16px;
  text-align: center;
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 6px;
}
.bloc strong {
  font-size: 30px;
  font-weight: 500;
  color: var(--texte);
}
.bloc span {
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--gris);
}

/* La jauge : un rail gris (.jauge) qui contient une barre bleue (.jauge-remplie) */
.jauge {
  width: 75%;
  height: 10px;
  background: var(--rail);
  border-radius: 5px;
  overflow: hidden; /* coupe ce qui dépasse du rail */
  margin-top: 6px;
}
.jauge-remplie {
  height: 100%;
  background: var(--bleu);
  border-radius: 5px;
  transition: width 0.6s ease; 
}
.phrase {
  margin: 0;
  padding: 18px 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
  line-height: 1.5; 
}
</style>