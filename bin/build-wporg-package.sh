#!/usr/bin/env bash
#
# Builds a clean, WordPress.org-ready copy of the plugin: runtime files
# only (no tests, no dev tooling, no internal docs). Rebuilds JS assets
# first so `build/` is always current.
#
# Usage: bin/build-wporg-package.sh
# Output: dist/blockshifter/ (unzipped) and dist/blockshifter-<version>.zip

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VERSION=$(grep -m1 "^Stable tag:" readme.txt | sed 's/Stable tag: *//')
DIST_DIR="$ROOT_DIR/dist"
PACKAGE_DIR="$DIST_DIR/blockshifter"

echo "Building JS assets..."
npm run build

echo "Preparing package for version $VERSION..."
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

cp blockshifter.php "$PACKAGE_DIR/"
cp readme.txt "$PACKAGE_DIR/"
cp -R includes "$PACKAGE_DIR/includes"
cp -R build "$PACKAGE_DIR/build"

ZIP_PATH="$DIST_DIR/blockshifter-$VERSION.zip"
rm -f "$ZIP_PATH"
(cd "$DIST_DIR" && zip -rq "blockshifter-$VERSION.zip" blockshifter)

echo "Package ready: $ZIP_PATH"
