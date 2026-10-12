<script setup>
import { computed } from 'vue'
import { formatEuro } from '../utils/format'

// Props : données reçues du parent (ce composant ne va rien chercher lui-même)
const props = defineProps({
  nom: String, // nom de la catégorie
  couleur: String, // couleur de l'arc (ex : "#4db5ff")
  montant: Number, // total dépensé dans la catégorie ce mois-ci
  pourcentage: Number, // part du budget, de 0 à 100 (ou plus)
})

// L'anneau est un cercle SVG de rayon 50.
// Son tour complet (circonférence) = 2 × π × rayon
const RAYON = 50
const CIRCONFERENCE = 2 * Math.PI * RAYON

// Longueur de l'arc coloré à dessiner.
// Math.min(..., 100) plafonne à 100 % pour ne pas dépasser le cercle.
// Dans le script, une prop s'écrit props.pourcentage.
const trait = computed(() => (Math.min(props.pourcentage, 100) / 100) * CIRCONFERENCE)
</script>

<template>
  <div class="carte">
    <h3>{{ nom }}</h3>
    <div class="anneau">
      <!-- SVG : dessin vectoriel. viewBox définit son système de coordonnées -->
      <svg viewBox="0 0 120 120">
        <!-- Cercle gris de fond (cx, cy = centre ; r = rayon) -->
        <circle cx="60" cy="60" :r="RAYON" class="fond" />

        <!-- Cercle coloré qui montre la progression.
             stroke-dasharray="A B" : on dessine un trait de longueur A, puis
             un vide de longueur B. Avec A = trait et B = tour complet, on obtient
             un arc partiel : c'est ça qui fait la progression. -->
        <circle
          cx="60"
          cy="60"
          :r="RAYON"
          class="progression"
          :stroke="couleur"
          :stroke-dasharray="`${trait} ${CIRCONFERENCE}`"
        />
      </svg>

      <!-- Texte au centre de l'anneau -->
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
  stroke-linecap: butt; 
  transition: stroke-dasharray 0.6s ease; 
}
.centre {
  position: absolute; 
  inset: 0; 
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