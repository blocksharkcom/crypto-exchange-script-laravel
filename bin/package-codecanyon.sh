#!/usr/bin/env bash
#
# Package CrossSwap into a CodeCanyon-ready archive.
#
# Produces dist/crossswap-<version>.zip with the **CodeCanyon submission
# convention** layout:
#
#   crossswap-<version>/
#     readme.txt
#     changelog.txt
#     licensing/
#       license.txt
#       LICENSE.md
#     documentation/        (standalone docs, copied from public/documentation)
#     sql/                  (MySQL + SQLite demo dumps + README)
#     main_files/
#       crossswap/          (the actual Laravel app — full tree)
#
# Sanitised: no .env, no installed.lock, no real DB, no .git, no node_modules,
# no IDE folders, no Mac junk.
#
# Usage:
#   bin/package-codecanyon.sh [version]

set -euo pipefail

VERSION="${1:-1.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
STAGE="$DIST/crossswap-$VERSION"
APP_STAGE="$STAGE/main_files/crossswap"

cd "$ROOT"

# ── Sanity checks ───────────────────────────────────────────────────────────
[[ -f .env.example ]]              || { echo "Missing .env.example"; exit 1; }
[[ -f LICENSE.md ]]                || { echo "Missing LICENSE.md"; exit 1; }
[[ -f CHANGELOG.md ]]              || { echo "Missing CHANGELOG.md"; exit 1; }
[[ -d public/build ]]              || { echo "Missing public/build — run: npm run build"; exit 1; }
[[ -d public/documentation ]]      || { echo "Missing public/documentation/"; exit 1; }
[[ -f database/seeders/DemoDataSeeder.php ]] || { echo "Missing DemoDataSeeder.php"; exit 1; }

command -v sqlite3 >/dev/null  || { echo "Missing sqlite3 binary"; exit 1; }
command -v php >/dev/null      || { echo "Missing php binary"; exit 1; }
command -v composer >/dev/null || { echo "Missing composer binary"; exit 1; }
command -v zip >/dev/null      || { echo "Missing zip binary"; exit 1; }

echo "→ Preparing stage at $STAGE"
rm -rf "$STAGE"
mkdir -p "$APP_STAGE"
mkdir -p "$STAGE/licensing"
mkdir -p "$STAGE/sql"

# ── Install production composer dependencies into the archive ───────────────
# Buyers don't need to run composer; vendor/ is shipped pre-resolved.
echo "→ Installing composer dependencies (prod only) — dev tools will be restored at end"
composer install --no-dev --optimize-autoloader --no-interaction --quiet

# ── Stash the developer's database/database.sqlite ─────────────────────────
DEV_DB_BACKUP=""
if [[ -f "$ROOT/database/database.sqlite" ]]; then
    DEV_DB_BACKUP="$(mktemp -t crossswap-dev-db.XXXXXX.sqlite)"
    cp "$ROOT/database/database.sqlite" "$DEV_DB_BACKUP"
    echo "  ✓ stashed developer DB to $DEV_DB_BACKUP"
fi

# ── Copy Laravel source files into main_files/crossswap/ ───────────────────
echo "→ Staging Laravel app into $APP_STAGE"
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
    "$ROOT/" "$APP_STAGE/"

# ── Provision empty placeholders so directory shape is preserved ────────────
touch "$APP_STAGE/storage/logs/.gitkeep"
mkdir -p "$APP_STAGE/database"
touch "$APP_STAGE/database/.gitkeep"
mkdir -p "$APP_STAGE/storage/framework/cache/data"
mkdir -p "$APP_STAGE/storage/framework/sessions"
mkdir -p "$APP_STAGE/storage/framework/views"
mkdir -p "$APP_STAGE/storage/app/public"

# ── Hard-strip Mac-only junk ───────────────────────────────────────────────
find "$STAGE" -name ".DS_Store" -delete
find "$STAGE" -name "Thumbs.db" -delete

# ── Sanity verify ───────────────────────────────────────────────────────────
echo "→ Verifying no install lock / sqlite / .env leaked"
[[ ! -f "$APP_STAGE/storage/app/installed.lock" ]] || { echo "FAIL: installed.lock present"; exit 1; }
[[ ! -f "$APP_STAGE/database/database.sqlite" ]]   || { echo "FAIL: sqlite present"; exit 1; }
[[ ! -f "$APP_STAGE/.env" ]]                       || { echo "FAIL: .env present"; exit 1; }
echo "  ✓ all clean"

# ── Build flattened single-file documentation into the archive ─────────────
# The live demo serves the multi-page docs from /public/documentation; the
# CodeCanyon archive ships a single `documentation.html` with the PDF and an
# `assets/` subfolder so buyers see only two files at the documentation root.
echo "→ Building flattened documentation/"
node "$ROOT/scripts/build-archive-docs.mjs" "$STAGE/documentation"

# ── Write licensing/ ───────────────────────────────────────────────────────
echo "→ Writing licensing/"
cat > "$STAGE/licensing/license.txt" <<'LICENSE_TXT'
CrossSwap — Cross-Chain Multi-Blockchain Exchange with ChangeNOW Integration
Copyright (c) 2026 Blockshark

This product is sold through Envato Market (CodeCanyon). Your purchase
grants you a license under one of the following terms, depending on which
license you purchased:

  - Regular License: Use in a single end-product that you or your client
    can charge end-users for. See https://codecanyon.net/licenses/standard
    for the full text.
  - Extended License: Use in a single end-product where end-users CAN be
    charged. See https://codecanyon.net/licenses/standard/extended for
    the full text.

You may NOT redistribute this product, in whole or in part, in any form
that allows another person to download, copy, or use it without their
own purchase from CodeCanyon. You may NOT include the source code in a
product that competes with CrossSwap on CodeCanyon.

For support, documentation, and updates, please visit your CodeCanyon
item page and contact the author through the comments / support tab.
LICENSE_TXT

cp "$ROOT/LICENSE.md" "$STAGE/licensing/LICENSE.md"

# ── Write readme.txt ───────────────────────────────────────────────────────
echo "→ Writing readme.txt"
cat > "$STAGE/readme.txt" <<'README_TXT'
================================================================================
CrossSwap — Cross-Chain Multi-Blockchain Exchange with ChangeNOW Integration
================================================================================

Version : 1.1.0
Author  : Blockshark

A turn-key Laravel + React SaaS that lets you operate a non-custodial,
cross-chain crypto exchange in minutes. Plugs into ChangeNOW's partner API
for instant swaps, limit orders, and recurring (DCA) trades across 30+ chains
with no KYC required from the end user.

--------------------------------------------------------------------------------
WHERE TO FIND WHAT
--------------------------------------------------------------------------------

  documentation/documentation.html        Start here — full HTML documentation
  documentation/CrossSwap-Documentation.pdf  Printable PDF documentation
  sql/                                    Optional MySQL / SQLite demo dumps
  licensing/                              Envato license summary + bundled
                                          third-party license file
  main_files/crossswap/                   The actual Laravel application

--------------------------------------------------------------------------------
QUICK INSTALL (5 STEPS)
--------------------------------------------------------------------------------

  1. Upload the contents of main_files/crossswap/ to your hosting account.
  2. Point your domain's document root at the public/ directory.
  3. Copy .env.example to .env (the web installer fills in the rest).
  4. Visit https://your-domain.com/install and follow the wizard.
  5. Done — sign in to /admin with the credentials you created.

For detailed steps (Apache/Nginx vhost samples, queue worker, cron, mail),
open documentation/documentation.html and jump to the Installation chapter.

--------------------------------------------------------------------------------
LIVE DEMO
--------------------------------------------------------------------------------

  URL    : https://cross-swap.blockshark.com
  Admin  : admin@demo.com  / password!321
  User   : user@demo.com   / password!321

--------------------------------------------------------------------------------
REQUIREMENTS
--------------------------------------------------------------------------------

  - PHP 8.2 or newer (8.3 recommended)
  - Composer 2.x (only if you wish to re-install vendor dependencies;
    vendor/ ships pre-installed)
  - One of: SQLite 3.35+, MySQL 8+, MariaDB 10.6+, PostgreSQL 13+
  - ext-pdo, ext-mbstring, ext-bcmath, ext-openssl, ext-curl, ext-fileinfo,
    ext-tokenizer, ext-xml, ext-zip
  - Writable storage/ and bootstrap/cache/ directories
  - A ChangeNOW partner API key (free — sign up at changenow.io/affiliate)

--------------------------------------------------------------------------------
SUPPORT
--------------------------------------------------------------------------------

Open the CodeCanyon item page for CrossSwap and use the Comments tab for
pre-sale questions, or the Support tab if you have an active support entitlement
attached to your purchase. Please include your purchase code when contacting
support.

Thank you for buying CrossSwap.
README_TXT

# ── Convert CHANGELOG.md → changelog.txt ───────────────────────────────────
echo "→ Converting CHANGELOG.md → changelog.txt"
php -r '
$src = file_get_contents("CHANGELOG.md");
// Strip code fences and inline backticks
$src = preg_replace("/`+/", "", $src);
// Convert ## headers → blank line + uppercase
$out = [];
foreach (explode("\n", $src) as $line) {
    if (preg_match("/^# (.*)$/", $line, $m)) {
        $out[] = strtoupper($m[1]);
        $out[] = str_repeat("=", strlen($m[1]));
        continue;
    }
    if (preg_match("/^## (.*)$/", $line, $m)) {
        $out[] = "";
        $out[] = strtoupper($m[1]);
        $out[] = str_repeat("-", strlen($m[1]));
        continue;
    }
    if (preg_match("/^### (.*)$/", $line, $m)) {
        $out[] = "";
        $out[] = $m[1] . ":";
        continue;
    }
    // Strip bold/italic markers
    $line = preg_replace("/\*\*(.+?)\*\*/", "$1", $line);
    $line = preg_replace("/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/", "$1", $line);
    // Convert markdown links [text](url) → text (url)
    $line = preg_replace("/\[([^\]]+)\]\(([^)]+)\)/", "$1 ($2)", $line);
    // Normalize bullet markers to "- "
    $line = preg_replace("/^(\s*)[-*]\s+/", "$1- ", $line);
    $out[] = $line;
}
file_put_contents("'"$STAGE"'/changelog.txt", implode("\n", $out));
'

# ── Generate SQL demo dumps ────────────────────────────────────────────────
echo "→ Generating SQL demo dumps (SQLite + MySQL)"

# We use a TEMP sqlite file (not the one in database/) to avoid touching the
# developer's working DB during the long-running seeder. We then move it into
# database/database.sqlite for the dump step, because Laravel's DB config
# points at the canonical path. We restore the original DB at the end.

TMP_DB="$ROOT/database/database.sqlite"
rm -f "$TMP_DB"
touch "$TMP_DB"

# Ensure config points at sqlite even if a .env is present.
APP_KEY_BACKUP=""
TMP_ENV=""
if [[ -f "$ROOT/.env" ]]; then
    TMP_ENV="$(mktemp -t crossswap-dev-env.XXXXXX)"
    cp "$ROOT/.env" "$TMP_ENV"
fi
cp "$ROOT/.env.example" "$ROOT/.env"
# Generate a throwaway key for seeding (artisan refuses to run without one)
php artisan key:generate --force --quiet >/dev/null

# Tell artisan to use sqlite + this file.
# DemoDataSeeder depends on AdminRolesSeeder (roles/permissions for the admin
# guard), so we run the default DatabaseSeeder first (which seeds those roles),
# then the demo data seeder on top.
DB_CONNECTION=sqlite DB_DATABASE="$TMP_DB" php artisan db:wipe --force --quiet
DB_CONNECTION=sqlite DB_DATABASE="$TMP_DB" php artisan migrate --force --quiet
DB_CONNECTION=sqlite DB_DATABASE="$TMP_DB" php artisan db:seed --force --quiet
DB_CONNECTION=sqlite DB_DATABASE="$TMP_DB" php artisan db:seed --class=Database\\Seeders\\DemoDataSeeder --force --quiet

# SQLite dump
sqlite3 "$TMP_DB" .dump > "$STAGE/sql/crossswap-demo-sqlite.sql"
echo "  ✓ sqlite dump: $(wc -l < "$STAGE/sql/crossswap-demo-sqlite.sql") lines"

# Convert to MySQL-flavored SQL
python3 - "$STAGE/sql/crossswap-demo-sqlite.sql" "$STAGE/sql/crossswap-demo-mysql.sql" <<'PYEOF'
import re, sys
src, dst = sys.argv[1], sys.argv[2]
out_lines = ["-- CrossSwap demo data — MySQL-flavored dump",
             "-- Generated from the canonical SQLite dump.",
             "-- Run against an empty MySQL/MariaDB database AFTER the installer has",
             "-- created the schema via `php artisan migrate`.",
             "SET FOREIGN_KEY_CHECKS=0;",
             ""]
with open(src) as fh:
    for line in fh:
        s = line.rstrip("\n")
        if s.startswith("PRAGMA"): continue
        if s.startswith("BEGIN TRANSACTION"): continue
        if s.startswith("COMMIT"): continue
        if s.startswith("CREATE TABLE sqlite_"): continue
        if s.startswith("DELETE FROM sqlite_"): continue
        if s.startswith("INSERT INTO sqlite_"): continue
        if s.startswith("ANALYZE"): continue
        if s.startswith("CREATE TABLE IF NOT EXISTS \"migrations\"") or s.startswith("CREATE TABLE \"migrations\""):
            # Skip framework tables that the installer recreates? No — keep them
            # so the dump is self-contained. Just rewrite syntax.
            pass
        # AUTOINCREMENT → AUTO_INCREMENT (case-insensitive — Laravel emits lowercase)
        s = re.sub(r'(?i)integer primary key autoincrement', 'INT PRIMARY KEY AUTO_INCREMENT', s)
        s = re.sub(r'(?i)autoincrement', 'AUTO_INCREMENT', s)
        # SQLite's `varchar` with no length → varchar(255) for MySQL
        s = re.sub(r'`(\w+)` varchar(?!\()', r'`\1` varchar(255)', s)
        # SQLite `datetime` → MySQL DATETIME (already compatible). text is fine.
        # "identifier" → `identifier`
        s = re.sub(r'"([A-Za-z_][A-Za-z0-9_]*)"', r'`\1`', s)
        out_lines.append(s)
out_lines.append("")
out_lines.append("SET FOREIGN_KEY_CHECKS=1;")
with open(dst, "w") as fh:
    fh.write("\n".join(out_lines))
PYEOF

echo "  ✓ mysql dump: $(wc -l < "$STAGE/sql/crossswap-demo-mysql.sql") lines"

# sql/README.txt
cat > "$STAGE/sql/README.txt" <<'SQL_README'
CrossSwap demo database dumps
=============================

This folder contains pre-seeded demo data that mirrors the live demo at
https://cross-swap.blockshark.com — sample transactions, tickets, content
sections, pages, admin + customer accounts, etc.

Files
-----

  crossswap-demo-sqlite.sql   Canonical dump in SQLite syntax.
  crossswap-demo-mysql.sql    MySQL/MariaDB-flavored conversion of the above.

When do I need to import this?
------------------------------

  - SQLite (default): NO. The web installer initializes a fresh SQLite
    database on its own. Optional: you can replace the resulting empty
    database/database.sqlite with one rebuilt from the SQLite dump if you
    want the demo content out of the box.

  - MySQL / MariaDB / PostgreSQL: OPTIONAL. After running the web installer
    you have two ways to load demo data:

      1. Easiest — run the demo data seeder:
           php artisan db:seed --class=Database\\Seeders\\DemoDataSeeder

      2. Or import the SQL dump matching your driver (use the MySQL dump
         for MariaDB too; PostgreSQL users should prefer option 1, since
         this dump is not Postgres-flavored).

Demo accounts
-------------

  Admin : admin@demo.com / password!321
  User  : user@demo.com  / password!321

Change these immediately after import on a production install.
SQL_README

# ── Restore developer's original DB / env ──────────────────────────────────
rm -f "$ROOT/database/database.sqlite"
if [[ -n "$DEV_DB_BACKUP" && -f "$DEV_DB_BACKUP" ]]; then
    cp "$DEV_DB_BACKUP" "$ROOT/database/database.sqlite"
    rm -f "$DEV_DB_BACKUP"
    echo "  ✓ restored developer DB"
fi
if [[ -n "$TMP_ENV" && -f "$TMP_ENV" ]]; then
    cp "$TMP_ENV" "$ROOT/.env"
    rm -f "$TMP_ENV"
    echo "  ✓ restored developer .env"
else
    rm -f "$ROOT/.env"
fi

# ── Zip ─────────────────────────────────────────────────────────────────────
echo "→ Zipping archive"
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
