export function formatEuro(n) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]