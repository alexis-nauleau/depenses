
export function formatEuro(n) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}