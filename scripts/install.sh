#!/usr/bin/env bash
set -euo pipefail

HARNESS_HOME="${AI_HARNESS_HOME:-$HOME/.ai-harness}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$HOME/.config"

if [[ "$REPO_ROOT" != "$HARNESS_HOME" ]]; then
  echo "Warning: repo is at $REPO_ROOT, expected $HARNESS_HOME"
  echo "You can set AI_HARNESS_HOME or clone to ~/.ai-harness."
fi

OPENCODE_TARGET="$HOME/.config/opencode"
OPENCODE_SOURCE="$REPO_ROOT/adapters/opencode/config"

if [[ -e "$OPENCODE_TARGET" && ! -L "$OPENCODE_TARGET" ]]; then
  echo "Existing $OPENCODE_TARGET is not a symlink. Not overwriting."
else
  ln -sfn "$OPENCODE_SOURCE" "$OPENCODE_TARGET"
  echo "Linked $OPENCODE_TARGET -> $OPENCODE_SOURCE"
fi

echo "Global harness entry point: $REPO_ROOT/AGENTS.md"
echo "OpenCode adapter entry: $OPENCODE_SOURCE/AGENTS.md"
echo "AI Harness install complete."
