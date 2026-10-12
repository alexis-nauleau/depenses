
export function formatEuro(n) {
  // 'fr-FR' = format français, style 'currency' + 'EUR' ajoute le symbole €
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

// Noms des mois. MOIS[0] = Janvier, donc le mois numéro 4 s'écrit MOIS[3]
export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]