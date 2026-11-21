#!/usr/bin/env bash
# Her degisiklikten sonra calistir: sozdizimi + smoke test
set -e
cd "$(dirname "$0")/.."
python3 tools/extract.py sky-sandbox-2d.html /tmp/game.js
node --check /tmp/game.js && echo "SYNTAX OK"
node tools/smoke.js
