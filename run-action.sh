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

node "$GITHUB_ACTION_PATH/cli.mjs" "${paths[@]}"
