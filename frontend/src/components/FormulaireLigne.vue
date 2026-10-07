<script setup>
import { ref } from 'vue'
import { API } from '../api'

// PROPS : la liste des catégories, pour remplir le menu déroulant
defineProps({ categories: Array })

// EMITS : message "ajoute" envoyé au parent quand une ligne est créée
const emit = defineEmits(['ajoute'])

// Une variable par champ du formulaire. Grâce à v-model (dans le template),
// elles se mettent à jour quand l'utilisateur tape, et inversement.
const titre = ref('')
const montant = ref('')
const type = ref('revenu') // "Revenu" est coché au départ
const categorieId = ref('')
const erreur = ref('')

// Envoie la nouvelle ligne au backend
async function envoyer() {
  erreur.value = ''

  // Validation avant l'envoi.
  // .trim() enlève les espaces au début et à la fin.
  // Number(...) convertit le texte du champ en nombre.
  if (!titre.value.trim() || !(Number(montant.value) > 0)) {
    erreur.value = 'Renseigne un titre et un montant positif.'
    return // on s'arrête ici, rien n'est envoyé
  }

  try {
    const res = await fetch(`${API}/depenses`, {
      method: 'POST', // POST = créer
      headers: { 'Content-Type': 'application/json' }, // on envoie du JSON
    
      body: JSON.stringify({
        titre: titre.value.trim(),
        montant: Number(montant.value),
        type: type.value,
        // Une catégorie seulement pour les dépenses, sinon null (= aucune)
        categorieId: type.value === 'depense' && categorieId.value ? categorieId.value : null,
      }),
    })
    if (!res.ok) throw new Error()

    // Succès : on vide le formulaire
    titre.value = ''
    montant.value = ''
    categorieId.value = ''

    // On prévient le parent, qui va recharger les données
    emit('ajoute')
  } catch (e) {
    erreur.value = "Impossible d'enregistrer la ligne."
  }
}
</script>

<template>

  <form class="formulaire" @submit.prevent="envoyer">
    <div class="choix">
      <!-- v-model sur des boutons radio : "type" prend la valeur du bouton coché -->
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

    <!--  que si "Dépense" est coché -->
    <select v-if="type === 'depense'" class="champ" v-model="categorieId">
      <option value="">Sans catégorie</option>
      <!-- Une option par catégorie. :value = ce qui est stocké dans categorieId -->
      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nom }}</option>
    </select>

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
.erreur {
  margin: 0;
  color: #c0203f;
  font-size: 13px;
}
</style>