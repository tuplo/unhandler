#!/usr/bin/env bash

rimraf dist
rimraf cjs
tsc --build tsconfig.build.json

esbuild src/index.cjs \
  --bundle \
  --platform=node \
  --outfile=cjs/index.js

esbuild src/index.ts \
  --bundle \
  --format=esm \
  --platform=node \
  --outfile=dist/index.mjs
