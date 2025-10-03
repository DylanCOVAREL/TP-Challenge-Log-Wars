// Helpers (pour évolutions futures, compression, etc.)
// Fonction pour calculer la médiane d'un tableau
export function median(arr) {
  if (arr.length === 0) return 0; // Retourne 0 si le tableau est vide
  const sorted = [...arr].sort((a, b) => a - b); // Trie le tableau par ordre croissant
  const mid = Math.floor(sorted.length / 2); // Trouve l'indice du milieu
  return sorted.length % 2
    ? sorted[mid] // Si le tableau a un nombre impair d'éléments, retourne l'élément du milieu
    : (sorted[mid - 1] + sorted[mid]) / 2; // Sinon, retourne la moyenne des deux éléments centraux
}

// Fonction pour calculer un centile donné d'un tableau
export function percentile(arr, p) {
  if (arr.length === 0) return 0; // Retourne 0 si le tableau est vide
  const sorted = [...arr].sort((a, b) => a - b); // Trie le tableau par ordre croissant
  const idx = Math.ceil((p / 100) * sorted.length) - 1; // Calcule l'indice correspondant au centile
  return sorted[idx]; // Retourne la valeur à cet indice
}
