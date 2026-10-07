<script setup>
import { computed } from 'vue'
import { formatEuro } from '../utils/format'

// PROPS : données reçues du parent
const props = defineProps({
  nom: String, // nom de la catégorie
  couleur: String, // couleur de l'arc (ex : "#4db5ff")
  montant: Number, // total dépensé dans la catégorie
  pourcentage: Number, // part du budget, de 0 à 100 (ou plus)
})


// Son tour complet (circonférence) = 2 × π × rayon
const RAYON = 50
const CIRCONFERENCE = 2 * Math.PI * RAYON

// Longueur de l'arc coloré à dessiner.
// Math.min(..., 100) plafonne à 100 % 
// Dans le script, une prop s'écrit props.nom (pas besoin de .value ici).
const trait = computed(() => (Math.min(props.pourcentage, 100) / 100) * CIRCONFERENCE)
</script>

<template>
  <div class="carte">
    <h3>{{ nom }}</h3>
    <div class="anneau">

      <svg viewBox="0 0 120 120">
    
        <circle cx="60" cy="60" :r="RAYON" class="fond" />

        <circle
          cx="60"
          cy="60"
          :r="RAYON"
          class="progression"
          :stroke="couleur"
          :stroke-dasharray="`${trait} ${CIRCONFERENCE}`"
        />
      </svg>

    
      <div class="centre">
        <strong>{{ formatEuro(montant) }}</strong>
        <span>{{ Math.round(pourcentage) }} % du budget</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carte {
  background: white;
  padding: 16px 8px;
  text-align: center;
}
h3 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--texte);
}
.anneau {
  position: relative; 
  width: 140px;
  margin: 0 auto;
}
svg {
  width: 100%;

  transform: rotate(-90deg);
}
circle {
  fill: none; 
  stroke-width: 10; 
}
.fond {
  stroke: var(--rail);
}
.progression {
  stroke-linecap: butt; /* extrémités de l'arc coupées droit */
  transition: stroke-dasharray 0.6s ease; /* animation quand le % change */
}
.centre {
  position: absolute; 
  inset: 0; /* occupe toute la zone de l'anneau */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
}
.centre strong {
  font-size: 16px;
  font-weight: 500;
  color: var(--texte);
}
.centre span {
  font-size: 10px;
  color: var(--gris);
}
</style>