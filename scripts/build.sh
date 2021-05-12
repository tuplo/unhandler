#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json
esbuild src/index.ts --bundle --format=esm --platform=node --outfile=dist/index.js --external:https
