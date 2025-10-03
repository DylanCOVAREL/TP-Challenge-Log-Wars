#!/usr/bin/env bash
set -euo pipefail

CMD="${1:-help}"

DATASET="${DATASET:-/data/logs_S.csv}"
QUERIES="${QUERIES:-/queries/suite_public.json}"
INDEX_DIR="${INDEX_DIR:-/index}"
RUNS="${RUNS:-5}"

case "$CMD" in
  help)
    echo "Usage:"
    echo "  engine build --data \$DATASET --index \$INDEX_DIR"
    echo "  engine q1 --index \$INDEX_DIR --t1 <ms> --t2 <ms>"
    echo "  engine q2 --index \$INDEX_DIR --t1 <ms> --t2 <ms> --k <k>"
    echo "  engine q3 --index \$INDEX_DIR --t1 <ms> --t2 <ms> --user <u> --action <a>"
    echo "  run-suite  : build + exécution du fichier de requêtes \$QUERIES (x\$RUNS)"
    ;;
  build)
    exec engine build --data "$DATASET" --index "$INDEX_DIR"
    ;;
  q1|q2|q3)
    shift
    exec engine "$CMD" "$@"
    ;;
  run-suite)
    engine build --data "$DATASET" --index "$INDEX_DIR" >/out/build.log 2>&1 || true
    for i in $(seq 1 "$RUNS"); do
      echo "Run $i/$RUNS"
      engine run-suite --index "$INDEX_DIR" --queries "$QUERIES" --outdir /out >/out/run_${i}.log 2>&1
    done
    echo "Résultats dans /out"
    ;;
  *)
    exec "$@"
    ;;
esac
