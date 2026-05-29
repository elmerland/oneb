#!/bin/bash
set -e

# Guard: no uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: uncommitted changes present. Commit or stash them first."
  exit 1
fi

# Guard: current commit exists on remote
git fetch origin
if ! git branch -r --contains HEAD | grep -q .; then
  echo "Error: current commit has not been pushed to remote. Push first."
  exit 1
fi

bun run build
wrangler pages deploy --branch main

TAG="deploy/$(date -u +%Y%m%d-%H%M%S)"
git tag "$TAG"
git push origin "$TAG"
gh release create "$TAG" --title "$TAG" --generate-notes
echo "Released: $TAG"
