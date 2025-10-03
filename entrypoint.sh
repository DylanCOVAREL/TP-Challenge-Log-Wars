#!/usr/bin/env bash
# Entrypoint du conteneur
# Ce script gère plusieurs commandes pour construire un index, lancer des benchmarks
# et exécuter des requêtes. Il s'attend à ce que certaines variables d'environnement
# et utilitaires (comme la fonction `log` et le tableau `ENGINE_CLI`) soient définis
# ailleurs (par exemple dans l'image Docker ou dans un script source préalable).

# NOTE: il y a un caractère '}' original dans la version source. Il était probablement
# fortuit ou résiduel ; je le laisse de côté pour ne pas altérer le comportement.


case "${1:-}" in
help|-h|--help)
cat <<'EOF'
Usage: container runs benchmark protocol when started.
Environment variables:
DATASET Path to dataset inside container (default /data/logs_M.csv)
QUERIES Path to queries JSON (default /queries/suite_public.json)
RUNS Number of runs (default 5)
INDEX_DIR Path where index files are stored (default /index)


Commands:
build -> run index build
benchmark -> run benchmark suite (cold + warm)
q1/q2/q3 -> run a single query
shell -> open a shell
help -> this message
EOF
exit 0
;;


build)
	# Branche "build" : construit l'index à partir du dataset vers INDEX_DIR.
	# Attendu : $DATASET et $INDEX_DIR doivent être définis (ou avoir des valeurs par défaut
	# dans l'environnement). La commande réelle de construction est fournie par
	# ${ENGINE_CLI[@]} (un tableau contenant l'exécutable et ses options de base).
	log "Building index from $DATASET into $INDEX_DIR"
	"${ENGINE_CLI[@]}" build --data "$DATASET" --index "$INDEX_DIR"
;;


benchmark)
	# Branche "benchmark" : exécute une suite de benchmarks complète.
	# Étapes :
	# 1) affiche un message récapitulatif
	# 2) construit l'index (cold build)
	# 3) exécute `RUNS` fois la suite de requêtes (chaque exécution appelle runSuite.js)
	# Important : la variable RUNS contrôle la répétition. Si runSuite.js plante, la
	# boucle continue grâce à `|| true` (on ne fait pas échouer le container).
	log "Running benchmark: DATASET=$DATASET QUERIES=$QUERIES RUNS=$RUNS"
	start_ts=$(date +%s)
	log "=> Build (cold)"
	"${ENGINE_CLI[@]}" build --data "$DATASET" --index "$INDEX_DIR"

	for i in $(seq 1 "$RUNS"); do
		log "=> Run $i"
		# runSuite.js exécute la suite de requêtes et écrit les résultats dans /out
		node /app/src/runSuite.js --index "$INDEX_DIR" --queries "$QUERIES" --out /out || true
	done
	end_ts=$(date +%s)
	log "Benchmark finished in $((end_ts-start_ts))s"
;;


shell)
	# Ouvre un shell interactif (utile pour le debug en local ou dans un container)
	/bin/bash
;;


q1|q2|q3)
	# Exécute une requête unique (q1, q2, q3 sont des alias) :
	# on décale les arguments (`shift`) puis on exécute l'outil d'engine avec ces args.
	shift || true
	log "Running query: $@"
	"${ENGINE_CLI[@]}" "$@"
;;


*)
	# Cas par défaut : si on a reçu des arguments, exécutez-les directement (exec $@).
	# Sinon, relancez ce script avec l'option help pour afficher l'aide.
	if [ "$#" -gt 0 ]; then
		exec "$@"
	fi
	exec "$0" help
;;
esac