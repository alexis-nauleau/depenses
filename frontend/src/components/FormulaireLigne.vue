<script setup>
import { ref, watch } from 'vue'
import { apiFetch } from '../api'
import { MOIS } from '../utils/format'

const props = defineProps({ categories: Array, annee: Number, mois: Number })
const emit = defineEmits(['ajoute'])

const titre = ref('')
const montant = ref('')
const type = ref('revenu')
const categorieId = ref('')
const moisCoches = ref([]) // numéros des mois cochés, ex : [4, 5, 6]
const erreur = ref('')

// Par défaut, seul le mois affiché est coché
watch(
  () => props.mois,
  (m) => (moisCoches.value = [m]),
  { immediate: true },
)

const tous = () => (moisCoches.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
const aPartirDeCeMois = () => {
  moisCoches.value = Array.from({ length: 13 - props.mois }, (_, i) => props.mois + i)
}
const seulementCeMois = () => (moisCoches.value = [props.mois])

async function envoyer() {
  erreur.value = ''
  if (!titre.value.trim() || !(Number(montant.value) > 0)) {
    erreur.value = 'Renseigne un titre et un montant positif.'
    return
  }
  if (moisCoches.value.length === 0) {
    erreur.value = 'Coche au moins un mois.'
    return
  }
  try {
    const res = await apiFetch('/depenses', {
      method: 'POST',
      body: {
        titre: titre.value.trim(),
        montant: Number(montant.value),
        type: type.value,
        categorieId: type.value === 'depense' && categorieId.value ? categorieId.value : null,
        annee: props.annee,
        mois: moisCoches.value,
      },
    })
    if (!res.ok) throw new Error()
    titre.value = ''
    montant.value = ''
    categorieId.value = ''
    seulementCeMois()
    emit('ajoute')
  } catch (e) {
    erreur.value = "Impossible d'enregistrer la ligne."
  }
}
</script>

<template>
  <form class="formulaire" @submit.prevent="envoyer">
    <div class="choix">
      <label><input type="radio" value="revenu" v-model="type" /> Revenu</label>
      <label><input type="radio" value="depense" v-model="type" /> Dépense</label>
    </div>

    <input class="champ" v-model="titre" placeholder="Ex : CAF, Salaire, Loyer…" />
    <input
      class="champ"
      v-model="montant"
      type="number"
      step="0.01"
      min="0"
      placeholder="Montant en €"
    />

    <select v-if="type === 'depense'" class="champ" v-model="categorieId">
      <option value="">Sans catégorie</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nom }}</option>
    </select>

    <fieldset class="mois">
      <legend>Mois concernés ({{ annee }})</legend>
      <label v-for="(nom, i) in MOIS" :key="nom" class="case">
        <input type="checkbox" :value="i + 1" v-model="moisCoches" />
        {{ nom.slice(0, 3) }}
      </label>
    </fieldset>
    <div class="raccourcis">
      <button type="button" @click="seulementCeMois">Ce mois</button>
      <button type="button" @click="aPartirDeCeMois">Ce mois et suivants</button>
      <button type="button" @click="tous">Toute l'année</button>
    </div>

    <button class="bouton" type="submit">Ajouter</button>
    <p v-if="erreur" class="erreur">{{ erreur }}</p>
  </form>
</template>

<style scoped>
.formulaire {
  background: white;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.choix {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #555;
}
.mois {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  border: 1px solid var(--bordure);
  border-radius: 6px;
  padding: 8px 10px;
}
.mois legend {
  font-size: 12px;
  color: var(--gris);
  padding: 0 4px;
}
.case {
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
}
.raccourcis {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.raccourcis button {
  background: var(--rail);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  color: var(--texte);
}
.erreur {
  margin: 0;
  color: #c0203f;
  font-size: 13px;
}
</style>