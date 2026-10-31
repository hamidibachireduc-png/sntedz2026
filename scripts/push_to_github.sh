#!/bin/bash
# Script to push SNTE 2026 Portal to GitHub repository:
# https://github.com/hamidibachireduc-png/sntedz2026

REPO_URL="https://github.com/hamidibachireduc-png/sntedz2026.git"

if [ -z "$1" ]; then
  echo "Usage: $0 <GITHUB_PERSONAL_ACCESS_TOKEN>"
  echo "Example: $0 ghp_yourTokenHere123"
  exit 1
fi

TOKEN="$1"
AUTH_REPO="https://${TOKEN}@github.com/hamidibachireduc-png/sntedz2026.git"

echo "=== Pushing to https://github.com/hamidibachireduc-png/sntedz2026 ==="
git remote set-url origin "$AUTH_REPO"
git branch -M main
git add .
git commit -m "feat: complete deployment of SNTE 2026 portal with official digital platforms" || true
git push -u origin main --force

echo "=== Successfully pushed to https://github.com/hamidibachireduc-png/sntedz2026 ==="
