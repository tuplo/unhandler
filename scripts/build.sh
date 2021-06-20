#!/usr/bin/env bash

rimraf dist
rimraf cjs
tsc --build tsconfig.build.json

esbuild src/index.cjs --bundle --platform=node --outfile=cjs/index.js \
  --external:node-fetch --external:https
esbuild src/index.ts --bundle --format=esm --outfile=dist/index.js \
  --external:node-fetch --external:https
