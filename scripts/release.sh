#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh [patch|minor|major] [--dry-run]
# Default bump type: patch

BUMP=${1:-patch}
DRY_RUN=false
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true
done

# Validate bump type
case "$BUMP" in
  patch|minor|major) ;;
  *) echo "Error: bump type must be patch, minor, or major (got '$BUMP')"; exit 1 ;;
esac

# Ensure working tree is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is dirty. Commit or stash changes before releasing."
  git status --short
  exit 1
fi

# Ensure on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" ]]; then
  echo "Warning: not on main branch (currently on '$BRANCH'). Continue? [y/N]"
  read -r confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi

# Bump version in package.json
echo "Bumping $BUMP version..."
npm version "$BUMP" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: $NEW_VERSION"

# Build
echo "Building..."
npm run build

if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] Would commit, tag v$NEW_VERSION, push, and publish to npm."
  # Reset the version bump
  git checkout package.json
  exit 0
fi

# Commit version bump
git add package.json package-lock.json
git commit -m "chore: release v$NEW_VERSION"

# Tag and push
git tag "v$NEW_VERSION"
git push origin "$BRANCH"
git push origin "v$NEW_VERSION"

# Publish to npm
echo "Publishing to npm..."
npm publish --access public

echo ""
echo "Released v$NEW_VERSION successfully."
