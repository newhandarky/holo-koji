#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

feature_dir="$(.specify/scripts/bash/check-prerequisites.sh --json --paths-only | sed -E 's/.*"FEATURE_DIR":"([^"]+)".*/\1/')"
plan_file="$feature_dir/plan.md"

if [[ ! -f "$plan_file" ]]; then
  cp "$ROOT_DIR/.specify/templates/plan-template.md" "$plan_file"
fi

printf '{"FEATURE_DIR":"%s","PLAN_FILE":"%s"}\n' "$feature_dir" "$plan_file"
