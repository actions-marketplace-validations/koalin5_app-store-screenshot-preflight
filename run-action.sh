#!/usr/bin/env bash
set -euo pipefail

paths=()
while IFS= read -r path; do
  [[ -z "$path" ]] || paths+=("$path")
done <<< "${SCREENSHOT_PATHS:-}"

if [[ ${#paths[@]} -eq 0 ]]; then
  echo 'Provide at least one screenshot file or locale folder in the paths input.' >&2
  exit 1
fi

sizes=()
while IFS= read -r size; do
  [[ -z "$size" ]] || sizes+=(--require-size "$size")
done <<< "${SCREENSHOT_REQUIRED_SIZES:-}"

if [[ ${#sizes[@]} -gt 0 ]]; then
  node "$GITHUB_ACTION_PATH/cli.mjs" "${sizes[@]}" -- "${paths[@]}"
else
  node "$GITHUB_ACTION_PATH/cli.mjs" -- "${paths[@]}"
fi
