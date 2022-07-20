#!/usr/bin/env bash
set -euo pipefail

main() {
  rm -rf dist
  rm -rf cjs
  tsc --build tsconfig.build.json

  esbuild src/index.ts \
    --bundle \
    --platform=node \
    --minify \
    --outfile=dist/index.cjs.js

  esbuild src/index.ts \
    --bundle \
    --format=esm \
    --platform=node \
    --minify \
    --outfile=dist/index.esm.js

  rm dist/github.js dist/index.js
}

main
