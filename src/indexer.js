import fs from "fs"; // Module pour manipuler le système de fichiers
import readline from "readline"; // Module pour lire les fichiers ligne par ligne
import path from "path"; // Module pour manipuler les chemins de fichiers

// Fonction pour construire un index à partir d'un fichier de données
export async function buildIndex(dataPath, indexDir) {
  console.error(`[indexer] Building index from ${dataPath} -> ${indexDir}`);

  // Création du répertoire d'index s'il n'existe pas
  if (!fs.existsSync(indexDir)) fs.mkdirSync(indexDir, { recursive: true });

  const logs = []; // Tableau pour stocker les logs
  const rl = readline.createInterface({
    input: fs.createReadStream(dataPath), // Lecture du fichier de données
    crlfDelay: Infinity, // Gestion des fins de ligne
  });

  // Lecture ligne par ligne du fichier de données
  for await (const line of rl) {
    if (!line.trim()) continue; // Ignore les lignes vides
    const [ts, userId, actionId] = line.split(","); // Découpe la ligne en colonnes
    logs.push({
      ts: Number(ts), // Timestamp
      userId, // Identifiant utilisateur
      actionId, // Identifiant action
    });
  }

  // Tri des logs par timestamp
  logs.sort((a, b) => a.ts - b.ts);

  // Sauvegarde des logs triés dans un fichier JSON
  fs.writeFileSync(path.join(indexDir, "logs.json"), JSON.stringify(logs));

  console.error(`[indexer] Index built with ${logs.length} events`);
}
