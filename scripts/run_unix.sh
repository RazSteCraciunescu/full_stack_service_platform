#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."

if [ ! -f dist/server/src/server.js ]; then
  echo "Compiled server not found; building it first."
  npm run build
fi

exec node dist/server/src/server.js
