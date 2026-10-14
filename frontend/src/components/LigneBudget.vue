<script setup>
import { ref } from 'vue'
import { formatEuro } from '../utils/format'

// Props : la ligne à afficher, et la classe CSS du montant (vert pour un revenu)
const props = defineProps({ ligne: Object, classeMontant: String })

// Messages envoyés au parent (via ListeLignes, jusqu'à App.vue)
const emit = defineEmits(['supprimer', 'modifier'])

// Cette ligne a trois états d'affichage : normal, édition, ou demande de suppression
const mode = ref('') // '' (normal), 'edition' ou 'suppression'
const titre = ref('')
const montant = ref('')

// Passe en mode édition en pré-remplissant les champs
function ouvrirEdition() {
  titre.value = props.ligne.titre
  montant.value = props.ligne.montant
  mode.value = 'edition'
}

// suite = true : la modification s'applique aussi aux mois suivants de la série
function valider(suite) {
  if (!titre.value.trim() || !(Number(montant.value) > 0)) return
  emit('modifier', props.ligne.id, {
    titre: titre.value.trim(),
    montant: Number(montant.value),
    suite,
  })
  mode.value = ''
}

function clicSupprimer() {
  // Ligne d'une série : on demande quoi supprimer. Sinon, suppression directe.
  if (props.ligne.serieId) mode.value = 'suppression'
  else emit('supprimer', props.ligne.id, false)
}

function supprimer(suite) {
  emit('supprimer', props.ligne.id, suite)
  mode.value = ''
}
</script>

<template>
  <div class="ligne">
    <template v-if="mode === 'edition'">
      <div class="edition">
        <input class="champ" v-model="titre" />
        <input class="champ" v-model="montant" type="number" step="0.01" min="0" />
        <div class="actions">

          <template v-if="ligne.serieId">
            <button class="bouton" @click="valider(false)">Ce mois seulement</button>
            <button class="bouton" @click="valider(true)">Ce mois et suivants</button>
          </template>
          <button v-else class="bouton" @click="valider(false)">Enregistrer</button>
          <button class="annuler" @click="mode = ''">Annuler</button>
        </div>
      </div>
    </template>

    <template v-else-if="mode === 'suppression'">
      <div class="edition">
        <span>Supprimer « {{ ligne.titre }} » :</span>
        <div class="actions">
          <button class="bouton" @click="supprimer(false)">Ce mois seulement</button>
          <button class="bouton" @click="supprimer(true)">Ce mois et suivants</button>
          <button class="annuler" @click="mode = ''">Annuler</button>
        </div>
      </div>
    </template>

    <template v-else>
      <span>
        {{ ligne.titre }}
        <!-- ↻ signale une ligne récurrente  -->
        <small v-if="ligne.serieId" title="Ligne récurrente">↻</small>
      </span>
      <span :class="classeMontant">{{ formatEuro(ligne.montant) }}</span>
      <span class="boutons">
        <button @click="ouvrirEdition" title="Modifier">✎</button>
        <button @click="clicSupprimer" title="Supprimer">✕</button>
      </span>
    </template>
  </div>
</template>

<style scoped>
.ligne {
  display: grid;
  grid-template-columns: 1fr auto 60px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f1f6;
  font-size: 14px;
  color: #444;
}
small {
  color: var(--bleu);
  margin-left: 4px;
}
.boutons button {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
}
.boutons button:hover {
  color: var(--rouge);
}
/* En édition, le bloc occupe toute la largeur (de la 1re à la dernière colonne) */
.edition {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ligne > span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
  min-width: 0;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.annuler {
  background: none;
  border: none;
  color: var(--gris);
  cursor: pointer;
}
</style>