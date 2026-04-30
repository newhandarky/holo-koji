#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --require-tasks) REQUIRE_TASKS=true ;;
    --include-tasks) INCLUDE_TASKS=true ;;
    --paths-only) PATHS_ONLY=true ;;
  esac
done

branch="$(git branch --show-current 2>/dev/null || true)"
feature_dir=""

if [[ -n "$branch" && -d "specs/$branch" ]]; then
  feature_dir="$ROOT_DIR/specs/$branch"
else
  latest="$(find "$ROOT_DIR/specs" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1 || true)"
  feature_dir="$latest"
fi

if [[ -z "$feature_dir" || ! -d "$feature_dir" ]]; then
  echo "ERROR: No feature directory found under specs/." >&2
  exit 1
fi

spec="$feature_dir/spec.md"
plan="$feature_dir/plan.md"
tasks="$feature_dir/tasks.md"

if [[ ! -f "$spec" ]]; then
  echo "ERROR: Missing spec.md in $feature_dir" >&2
  exit 1
fi

if [[ "$REQUIRE_TASKS" == "true" && ! -f "$tasks" ]]; then
  echo "ERROR: Missing tasks.md in $feature_dir" >&2
  exit 1
fi

available=()
[[ -f "$plan" ]] && available+=("plan.md")
[[ -f "$tasks" && "$INCLUDE_TASKS" == "true" ]] && available+=("tasks.md")
[[ -f "$feature_dir/research.md" ]] && available+=("research.md")
[[ -f "$feature_dir/data-model.md" ]] && available+=("data-model.md")
[[ -f "$feature_dir/quickstart.md" ]] && available+=("quickstart.md")
[[ -d "$feature_dir/contracts" ]] && available+=("contracts/")

json_array="["
if [[ ${#available[@]} -gt 0 ]]; then
  for item in "${available[@]}"; do
    json_array+="\"$item\","
  done
fi
json_array="${json_array%,}]"

if [[ "$PATHS_ONLY" == "true" ]]; then
  printf '{"ROOT_DIR":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' "$ROOT_DIR" "$feature_dir" "$spec" "$plan" "$tasks"
else
  printf '{"ROOT_DIR":"%s","FEATURE_DIR":"%s","AVAILABLE_DOCS":%s}\n' "$ROOT_DIR" "$feature_dir" "$json_array"
fi
