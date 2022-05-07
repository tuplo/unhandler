#!/usr/bin/env bash
set -euo pipefail

main() {
  rm -rf dist
  rm -rf cjs
  tsc --build tsconfig.build.json

  esbuild src/cjs/index.cjs \
    --bundle \
    --platform=node \
    --outfile=cjs/index.js

  esbuild src/index.ts \
    --bundle \
    --format=esm \
    --platform=node \
    --outfile=dist/index.mjs
}

main
