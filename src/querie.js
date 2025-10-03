import fs from "fs"; // Module pour manipuler le système de fichiers
import path from "path"; // Module pour manipuler les chemins de fichiers

// Fonction pour charger les logs depuis un fichier JSON
function loadLogs(indexDir) {
  const data = fs.readFileSync(path.join(indexDir, "logs.json"), "utf8");
  return JSON.parse(data); // Retourne les logs sous forme d'objet JavaScript
}

// Q1 : Compte le nombre d'utilisateurs distincts dans une plage de temps
export async function q1(indexDir, t1, t2) {
  const logs = loadLogs(indexDir);
  const users = new Set(); // Utilise un Set pour éviter les doublons
  for (const log of logs) {
    if (log.ts >= t1 && log.ts <= t2) {
      users.add(log.userId); // Ajoute l'utilisateur au Set
    }
  }
  return users.size; // Retourne le nombre d'utilisateurs distincts
}

// Q2 : Renvoie les actions les plus fréquentes dans une plage de temps
export async function q2(indexDir, t1, t2, k) {
  const logs = loadLogs(indexDir);
  const freq = {}; // Objet pour compter les fréquences des actions
  for (const log of logs) {
    if (log.ts >= t1 && log.ts <= t2) {
      freq[log.actionId] = (freq[log.actionId] || 0) + 1; // Incrémente le compteur
    }
  }

  // Trie les actions par fréquence décroissante
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, k).map(([action, count]) => ({ action, count })); // Retourne les k actions les plus fréquentes
}

// Q3 : Compte les occurrences d'une paire (utilisateur, action) dans une plage de temps
export async function q3(indexDir, t1, t2, user, action) {
  const logs = loadLogs(indexDir);
  let count = 0; // Compteur d'occurrences
  for (const log of logs) {
    if (
      log.ts >= t1 &&
      log.ts <= t2 &&
      log.userId === user &&
      log.actionId === action
    ) {
      count++; // Incrémente le compteur si les conditions sont remplies
    }
  }
  return count; // Retourne le nombre d'occurrences
}
