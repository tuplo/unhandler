#!/usr/bin/env bash

esbuild src/index.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=dist/index.mjs \
  --external:node-fetch \
  --watch
