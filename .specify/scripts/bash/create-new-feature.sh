#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

JSON=false
TIMESTAMP=false
SHORT_NAME=""
DESCRIPTION=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON=true; shift ;;
    --timestamp) TIMESTAMP=true; shift ;;
    --short-name)
      SHORT_NAME="${2:-}"
      shift 2
      ;;
    *)
      DESCRIPTION+=("$1")
      shift
      ;;
  esac
done

if [[ -z "$SHORT_NAME" ]]; then
  SHORT_NAME="$(printf '%s ' "${DESCRIPTION[@]}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g' | cut -c1-40)"
fi

if [[ -z "$SHORT_NAME" ]]; then
  echo "ERROR: Missing feature short name or description." >&2
  exit 1
fi

mkdir -p specs

if [[ "$TIMESTAMP" == "true" ]]; then
  prefix="$(date +%Y%m%d-%H%M%S)"
else
  last="$(find specs -mindepth 1 -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null | sed -E 's#^.*/([0-9]{3})-.*#\1#' | sort -n | tail -n 1 || true)"
  if [[ -z "$last" ]]; then
    prefix="001"
  else
    prefix="$(printf '%03d' "$((10#$last + 1))")"
  fi
fi

branch="${prefix}-${SHORT_NAME}"
feature_dir="$ROOT_DIR/specs/$branch"
spec_file="$feature_dir/spec.md"

mkdir -p "$feature_dir"

if [[ ! -f "$spec_file" ]]; then
  cp "$ROOT_DIR/.specify/templates/spec-template.md" "$spec_file"
fi

if ! git rev-parse --verify "$branch" >/dev/null 2>&1; then
  git branch "$branch" >/dev/null 2>&1 || true
fi

if [[ "$JSON" == "true" ]]; then
  printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_DIR":"%s"}\n' "$branch" "$spec_file" "$feature_dir"
else
  echo "BRANCH_NAME: $branch"
  echo "SPEC_FILE: $spec_file"
  echo "FEATURE_DIR: $feature_dir"
fi
