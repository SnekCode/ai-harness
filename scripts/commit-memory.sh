#!/usr/bin/env bash
set -euo pipefail

git status --short

git add okf core adapters scripts templates patterns evals README.md .gitignore .secrets.example

git commit -m "Update AI harness memory and config" || echo "No changes to commit."
