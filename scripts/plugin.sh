#!/usr/bin/env bash
#
# Install or uninstall effect-claude-primitives as a Claude Code plugin.
#
# Usage:
#   scripts/plugin.sh install [scope]     # scope: user (default) | project | local
#   scripts/plugin.sh uninstall
#   scripts/plugin.sh status
#
# By default the marketplace is added from this repo's own directory, so the
# plugin works locally without publishing. To install from GitHub instead
# (e.g. on another machine), set EFFECT_PLUGIN_SOURCE:
#   EFFECT_PLUGIN_SOURCE=stiproot/effect-claude-primitives scripts/plugin.sh install
#
set -euo pipefail

PLUGIN="effect-claude-primitives"
MARKETPLACE="effect-primitives"

# Repo root = parent of this script's directory. Lets the script run from anywhere.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Where to add the marketplace from. Local repo path by default; override with a
# GitHub "owner/repo" (or any source `claude plugin marketplace add` accepts).
SOURCE="${EFFECT_PLUGIN_SOURCE:-$REPO_ROOT}"

err() { printf 'error: %s\n' "$1" >&2; exit 1; }

command -v claude >/dev/null 2>&1 || err "the 'claude' CLI is not on PATH"

marketplace_present() {
  claude plugin marketplace list 2>/dev/null | grep -q "$MARKETPLACE"
}

cmd_install() {
  local scope="${1:-user}"

  if marketplace_present; then
    echo "Marketplace '$MARKETPLACE' already configured – refreshing from source."
    claude plugin marketplace update "$MARKETPLACE"
  else
    echo "Adding marketplace from: $SOURCE"
    claude plugin marketplace add "$SOURCE"
  fi

  echo "Installing $PLUGIN@$MARKETPLACE (scope: $scope)"
  claude plugin install "${PLUGIN}@${MARKETPLACE}" --scope "$scope"

  echo
  claude plugin details "$PLUGIN" || true
}

cmd_uninstall() {
  # Tolerate partial state: uninstall the plugin and drop the marketplace even
  # if one of them is already gone.
  claude plugin uninstall "$PLUGIN" || echo "Plugin '$PLUGIN' was not installed."
  claude plugin marketplace remove "$MARKETPLACE" || echo "Marketplace '$MARKETPLACE' was not configured."
  echo "Done."
}

cmd_status() {
  echo "Marketplace:"
  claude plugin marketplace list 2>/dev/null | grep -A1 "$MARKETPLACE" || echo "  (not configured)"
  echo "Plugin:"
  claude plugin list 2>/dev/null | grep "$PLUGIN" || echo "  (not installed)"
}

case "${1:-}" in
  install)   shift; cmd_install "$@" ;;
  uninstall) shift; cmd_uninstall ;;
  status)    cmd_status ;;
  *)
    sed -n '3,18p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
