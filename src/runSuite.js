#!/usr/bin/env node

// Importation des modules nécessaires
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import yargs from 'yargs'; // Module pour gérer les arguments CLI
import { hideBin } from 'yargs/helpers'; // Aide pour les arguments CLI
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

// Configuration des arguments CLI
const argv = yargs(hideBin(process.argv))
  .option('index', { type: 'string', demandOption: true }) // Répertoire de l'index
  .option('queries', { type: 'string', demandOption: true }) // Fichier JSON des requêtes
  .option('out', { type: 'string', demandOption: true }) // Répertoire de sortie
  .argv;

// Chargement des requêtes depuis le fichier JSON
const queries = JSON.parse(fs.readFileSync(argv.queries, 'utf8'));

// Création du répertoire de sortie s'il n'existe pas
const outDir = argv.out;
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const latencies = []; // Tableau pour stocker les latences

// Fonction pour exécuter une requête
function runQuery(q) {
  const start = performance.now(); // Début de la mesure de temps

  let args = [];
  if (q.type === 'q1') {
    args = ['q1', '--index', argv.index, '--t1', q.t1, '--t2', q.t2];
  } else if (q.type === 'q2') {
    args = ['q2', '--index', argv.index, '--t1', q.t1, '--t2', q.t2, '--k', q.k];
  } else if (q.type === 'q3') {
    args = ['q3', '--index', argv.index, '--t1', q.t1, '--t2', q.t2, '--user', q.user, '--action', q.action];
  } else {
    console.error('Unknown query type', q.type);
    return;
  }

  // Exécution de la commande avec les arguments
  const res = spawnSync('node', [path.join(__dirname, 'engine.js'), ...args], { encoding: 'utf-8' });

  const end = performance.now(); // Fin de la mesure de temps
  const latency = end - start; // Calcul de la latence
  latencies.push({ type: q.type, latency }); // Ajout de la latence au tableau
}

// Exécution de toutes les requêtes
for (const q of queries) {
  runQuery(q);
}

// Sauvegarde des latences dans un fichier CSV
const csv = latencies.map(l => `${l.type},${l.latency.toFixed(3)}`).join('\n');
fs.writeFileSync(path.join(outDir, 'latencies.csv'), csv, 'utf8');

// Calcul et sauvegarde d'un résumé des latences (P50 et P95)
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[idx];
}

const summary = {};
for (const type of ['q1', 'q2', 'q3']) {
  const arr = latencies.filter(l => l.type === type).map(l => l.latency);
  summary[type] = {
    p50: percentile(arr, 50), // Médiane
    p95: percentile(arr, 95) // 95e centile
  };
}

fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');