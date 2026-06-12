#!/usr/bin/env sh
set -eu

STATE_FILE="docs/IMPLEMENTATION_STATE.md"

if [ ! -f "$STATE_FILE" ]; then
  echo "Missing $STATE_FILE"
  exit 1
fi

awk '
  /^## Current Status/ { in_status=1; print; next }
  /^## Goal Roadmap/ { in_status=0; in_roadmap=1; print; next }
  /^## Execution Waves/ { in_roadmap=0 }
  /^## Next Action/ { in_next=1; print; next }
  in_status || in_roadmap || in_next { print }
' "$STATE_FILE"
