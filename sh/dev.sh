#!/usr/bin/env bash
set -euo pipefail

main() {
  esbuild src/index.ts \
    --bundle \
    --platform=node \
    --format=esm \
    --outfile=dist/index.esm.js \
    --watch
}

main
