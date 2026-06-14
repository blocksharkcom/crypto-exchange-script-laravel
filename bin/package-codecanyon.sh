#!/usr/bin/env bash
#
# Package CrossSwap into a CodeCanyon-ready archive.
#
# Produces dist/crossswap-<version>.zip with:
#   - all source + production build artifacts
#   - documentation/, LICENSE.md, CHANGELOG.md, README.md
#   - empty database file (.gitkept) — no demo data
#   - .env.example (no real .env)
#   - no .DS_Store, node_modules, vendor/, install lock, logs, cache, or sqlite data
#
# Usage:
#   bin/package-codecanyon.sh [version]
#
# After packaging:
#   1. Test the zip on a clean LAMP host
#   2. Walk through the installer
#   3. Verify the admin panel works end-to-end
#   4. Only then upload to CodeCanyon

set -euo pipefail

VERSION="${1:-1.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
STAGE="$DIST/crossswap-$VERSION"

cd "$ROOT"

# ── Sanity checks ───────────────────────────────────────────────────────────
[[ -f .env.example ]]      || { echo "Missing .env.example"; exit 1; }
[[ -f LICENSE.md ]]        || { echo "Missing LICENSE.md"; exit 1; }
[[ -f CHANGELOG.md ]]      || { echo "Missing CHANGELOG.md"; exit 1; }
[[ -d public/build ]]      || { echo "Missing public/build — run: npm run build"; exit 1; }
[[ -d public/documentation ]] || { echo "Missing public/documentation/"; exit 1; }

echo "→ Preparing stage at $STAGE"
rm -rf "$STAGE"
mkdir -p "$STAGE"

# ── Install production composer dependencies into the archive ───────────────
# Buyers don't need to run composer; vendor/ is shipped pre-resolved.
# We snapshot vendor/ first so the developer's dev deps survive packaging.
echo "→ Installing composer dependencies (prod only) — dev tools will be restored at end"
composer install --no-dev --optimize-autoloader --no-interaction --quiet

# ── Copy source files (rsync with strict excludes) ──────────────────────────
rsync -a \
    --exclude='.git/' \
    --exclude='.gitattributes' \
    --exclude='.gitignore' \
    --exclude='.github/' \
    --exclude='.idea/' \
    --exclude='.vscode/' \
    --exclude='.zed/' \
    --exclude='.claude/' \
    --exclude='.cursor/' \
    --exclude='.fleet/' \
    --exclude='.husky/' \
    --exclude='.turbo/' \
    --exclude='.npm/' \
    --exclude='.cache/' \
    --exclude='.DS_Store' \
    --exclude='._*' \
    --exclude='__MACOSX' \
    --exclude='Thumbs.db' \
    --exclude='desktop.ini' \
    --exclude='node_modules/' \
    --exclude='dist/' \
    --exclude='*.bak' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    --exclude='*.tmp' \
    --exclude='*.log' \
    --exclude='*.orig' \
    --exclude='.env' \
    --exclude='.env.backup' \
    --exclude='.env.local' \
    --exclude='.env.production' \
    --exclude='.env.testing' \
    --exclude='.phpunit.result.cache' \
    --exclude='.phpactor.json' \
    --exclude='auth.json' \
    --exclude='storage/app/installed.lock' \
    --exclude='storage/app/cache/' \
    --exclude='storage/app/rate/' \
    --exclude='storage/framework/cache/data/' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='storage/logs/*.log' \
    --exclude='database/database.sqlite' \
    --exclude='public/hot' \
    --exclude='public/preview-shots/' \
    --exclude='tests/' \
    --exclude='phpunit.xml' \
    --exclude='pint.json' \
    --exclude='/bin/package-codecanyon.sh' \
    --exclude='/bin/verify-archive.sh' \
    "$ROOT/" "$STAGE/"

# ── Provision empty placeholders so directory shape is preserved ────────────
touch "$STAGE/storage/logs/.gitkeep"
mkdir -p "$STAGE/database"
touch "$STAGE/database/.gitkeep"
mkdir -p "$STAGE/storage/framework/cache/data"
mkdir -p "$STAGE/storage/framework/sessions"
mkdir -p "$STAGE/storage/framework/views"
mkdir -p "$STAGE/storage/app/public"

# ── Hard-strip Mac-only junk ───────────────────────────────────────────────
find "$STAGE" -name ".DS_Store" -delete
find "$STAGE" -name "Thumbs.db" -delete

# ── Sanity verify ───────────────────────────────────────────────────────────
echo "→ Verifying no install lock / sqlite / .env leaked"
[[ ! -f "$STAGE/storage/app/installed.lock" ]] || { echo "FAIL: installed.lock present"; exit 1; }
[[ ! -f "$STAGE/database/database.sqlite" ]]   || { echo "FAIL: sqlite present"; exit 1; }
[[ ! -f "$STAGE/.env" ]]                       || { echo "FAIL: .env present"; exit 1; }
echo "  ✓ all clean"

# ── Zip ─────────────────────────────────────────────────────────────────────
ZIP_PATH="$DIST/crossswap-$VERSION.zip"
rm -f "$ZIP_PATH"
( cd "$DIST" && zip -qr "crossswap-$VERSION.zip" "crossswap-$VERSION" )

echo
echo "✓ Archive ready: $ZIP_PATH"
echo "  Size: $(du -h "$ZIP_PATH" | cut -f1)"
echo

# ── Restore developer's dev dependencies (phpunit, pint, etc.) ──────────────
echo "→ Restoring composer dev dependencies in the source tree"
composer install --no-interaction --quiet

echo
echo "Next steps:"
echo "  1. Upload to a clean LAMP test host."
echo "  2. Walk through /install."
echo "  3. Verify the admin panel works."
echo "  4. Then upload to CodeCanyon."
