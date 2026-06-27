#!/usr/bin/env bash
set -euo pipefail

HARNESS_HOME="${AI_HARNESS_HOME:-$HOME/.ai-harness}"
TEMPLATE="$HARNESS_HOME/templates/project-harness"

if [[ ! -d "$TEMPLATE" ]]; then
  echo "Template not found: $TEMPLATE" >&2
  exit 1
fi

copy_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ -e "$dst" ]]; then
    echo "Skip existing $dst"
  else
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    echo "Created $dst"
  fi
}

copy_if_missing "$TEMPLATE/AGENTS.md" "AGENTS.md"
copy_if_missing "$TEMPLATE/.harness/goal.yaml" ".harness/goal.yaml"
copy_if_missing "$TEMPLATE/.harness/quality-gates.yaml" ".harness/quality-gates.yaml"
copy_if_missing "$TEMPLATE/.harness/decision-log.md" ".harness/decision-log.md"
copy_if_missing "$TEMPLATE/.harness/state.example.json" ".harness/state.example.json"

echo "Project harness initialized."
