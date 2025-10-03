#!/usr/bin/env node

// Importation des modules nécessaires
import { Command } from "commander"; // Gestion des commandes CLI
import { buildIndex } from "./indexer.js"; // Fonction pour construire un index
import { q1, q2, q3 } from "./queries.js"; // Fonctions pour exécuter les requêtes

// Création d'une instance de commande CLI
const program = new Command();

// Configuration de base du programme CLI
program
  .name("engine") // Nom de l'outil CLI
  .description("LogWars engine CLI") // Description affichée dans l'aide
  .version("0.1.0"); // Version de l'outil

// Commande pour construire un index
program
  .command("build")
  .requiredOption("--data <path>", "Dataset CSV file") // Chemin vers le fichier de données
  .requiredOption("--index <dir>", "Index output directory") // Répertoire de sortie pour l'index
  .action(async (opts) => {
    // Action exécutée pour la commande "build"
    await buildIndex(opts.data, opts.index);
  });

// Commande pour exécuter la requête Q1
program
  .command("q1")
  .requiredOption("--index <dir>", "Index directory") // Répertoire contenant l'index
  .requiredOption("--t1 <ms>", "Start timestamp", parseInt) // Timestamp de début
  .requiredOption("--t2 <ms>", "End timestamp", parseInt) // Timestamp de fin
  .action(async (opts) => {
    // Action exécutée pour la commande "q1"
    const res = await q1(opts.index, opts.t1, opts.t2);
    console.log(res); // Affiche le résultat dans la console
  });

// Commande pour exécuter la requête Q2
program
  .command("q2")
  .requiredOption("--index <dir>", "Index directory")
  .requiredOption("--t1 <ms>", "Start timestamp", parseInt)
  .requiredOption("--t2 <ms>", "End timestamp", parseInt)
  .requiredOption("--k <int>", "Top K", parseInt) // Nombre d'éléments à retourner
  .action(async (opts) => {
    const res = await q2(opts.index, opts.t1, opts.t2, opts.k);
    console.log(JSON.stringify(res)); // Affiche le résultat sous forme JSON
  });

// Commande pour exécuter la requête Q3
program
  .command("q3")
  .requiredOption("--index <dir>", "Index directory")
  .requiredOption("--t1 <ms>", "Start timestamp", parseInt)
  .requiredOption("--t2 <ms>", "End timestamp", parseInt)
  .requiredOption("--user <id>", "UserId") // Identifiant de l'utilisateur
  .requiredOption("--action <id>", "ActionId") // Identifiant de l'action
  .action(async (opts) => {
    const res = await q3(opts.index, opts.t1, opts.t2, opts.user, opts.action);
    console.log(res);
  });

// Analyse des arguments de la ligne de commande
program.parse(process.argv);
