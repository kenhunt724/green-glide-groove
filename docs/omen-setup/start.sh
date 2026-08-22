#!/usr/bin/env bash
# One command to go from a bare Omen/WSL shell to the app running in dev mode.
#
#   bash docs/omen-setup/start.sh
#
# It will:
#   1. Run the bootstrap installer (skipped if the toolchain is already present).
#   2. Make sure a .env file exists with the backend variables the app needs.
#   3. Start the dev server on http://localhost:8080
#
# Flags:
#   --skip-bootstrap   don't re-run the installer
#   --reconfigure      re-enter the backend environment variables
#   --port <n>         serve on a different port (default 8080)

set -euo pipefail

die() {
  printf '\n\033[1;31mX %s\033[0m\n' "$1" >&2
  shift
  for line in "$@"; do printf '  %s\n' "$line" >&2; done
  printf '\n'
  exit 1
}

# ------------------------------------------------------------- preflight -----
# 0. Are we standing in a folder that still exists? (common after deleting or
#    renaming the project folder from Windows while the terminal stayed open)
if ! pwd >/dev/null 2>&1; then
  die "Your terminal is sitting in a folder that no longer exists." \
      "Fix it with these two lines, one at a time:" \
      "" \
      "  cd ~" \
      "  cd green-glide-groove" \
      "" \
      "Then run: bash docs/omen-setup/start.sh"
fi

# 1. Can we locate the script itself?
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || SCRIPT_DIR=""
if [ -z "$SCRIPT_DIR" ] || [ ! -f "$SCRIPT_DIR/start.sh" ]; then
  die "Could not find the setup folder (docs/omen-setup)." \
      "You are probably not inside the project folder." \
      "" \
      "  cd ~" \
      "  ls" \
      "" \
      "If you see green-glide-groove listed, run:" \
      "  cd green-glide-groove && bash docs/omen-setup/start.sh" \
      "" \
      "If you do NOT see it, clone it first:" \
      "  git clone https://github.com/kenhunt724/green-glide-groove.git"
fi

REPO_ROOT="$(cd "$SCRIPT_DIR/../.." 2>/dev/null && pwd)" || REPO_ROOT=""
[ -n "$REPO_ROOT" ] || die "Could not resolve the project root folder from $SCRIPT_DIR."

# 2. Is this really the project? package.json is the giveaway.
if [ ! -f "$REPO_ROOT/package.json" ]; then
  die "This folder is not the project ($REPO_ROOT has no package.json)." \
      "Go home and re-clone a clean copy:" \
      "" \
      "  cd ~" \
      "  git clone https://github.com/kenhunt724/green-glide-groove.git" \
      "  cd green-glide-groove" \
      "  bash docs/omen-setup/start.sh"
fi

# 3. Warn (don't block) if the project lives on the Windows drive — that path
#    causes permission errors and very slow installs under WSL.
case "$REPO_ROOT" in
  /mnt/[a-z]/*)
    printf '\n\033[1;33m! Heads up:\033[0m the project is on your Windows drive (%s).\n' "$REPO_ROOT" >&2
    printf '  This is slow and can cause "Operation not permitted" errors.\n' >&2
    printf '  Recommended: cd ~ && git clone https://github.com/kenhunt724/green-glide-groove.git\n\n' >&2
    ;;
esac

cd "$REPO_ROOT"


PORT=8080
SKIP_BOOTSTRAP=0
RECONFIGURE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --skip-bootstrap) SKIP_BOOTSTRAP=1; shift ;;
    --reconfigure)    RECONFIGURE=1; shift ;;
    --port)           PORT="${2:?--port needs a value}"; shift 2 ;;
    -h|--help)        sed -n '2,15p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

log()  { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"

# ---------------------------------------------------------------- bootstrap --
if [ "$SKIP_BOOTSTRAP" -eq 0 ]; then
  if have bun && have ffmpeg && have git && [ -d node_modules ]; then
    log "Toolchain already installed — skipping bootstrap (use --skip-bootstrap to force skip)"
  else
    log "Running bootstrap installer"
    bash "$SCRIPT_DIR/bootstrap-omen.sh"
    export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
  fi
fi

if ! have bun; then
  echo "bun is still not on PATH. Close and reopen the terminal, then re-run this script." >&2
  exit 1
fi

# ------------------------------------------------------------------- .env ----
ENV_FILE="$REPO_ROOT/.env"

needs_env() {
  [ "$RECONFIGURE" -eq 1 ] && return 0
  [ -f "$ENV_FILE" ] || return 0
  for key in VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY VITE_SUPABASE_PROJECT_ID; do
    grep -q "^${key}=." "$ENV_FILE" || return 0
  done
  return 1
}

if needs_env; then
  log "Backend environment variables needed"
  cat <<'EOF'
Copy these three values from your Lovable project (they are the publishable /
client-side values, safe to keep on your machine):

  VITE_SUPABASE_URL
  VITE_SUPABASE_PUBLISHABLE_KEY
  VITE_SUPABASE_PROJECT_ID

EOF
  read -r -p "VITE_SUPABASE_URL: " SB_URL
  read -r -p "VITE_SUPABASE_PUBLISHABLE_KEY: " SB_KEY
  read -r -p "VITE_SUPABASE_PROJECT_ID: " SB_ID

  if [ -z "$SB_URL" ] || [ -z "$SB_KEY" ] || [ -z "$SB_ID" ]; then
    echo "All three values are required. Re-run when you have them." >&2
    exit 1
  fi

  [ -f "$ENV_FILE" ] && cp "$ENV_FILE" "$ENV_FILE.bak"

  cat > "$ENV_FILE" <<EOF
# Generated by docs/omen-setup/start.sh — client-side backend config.
VITE_SUPABASE_URL=$SB_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SB_KEY
VITE_SUPABASE_PROJECT_ID=$SB_ID

# Server-side mirrors (same values, read by server functions).
SUPABASE_URL=$SB_URL
SUPABASE_PUBLISHABLE_KEY=$SB_KEY
SUPABASE_PROJECT_ID=$SB_ID
EOF
  chmod 600 "$ENV_FILE"
  log "Wrote $ENV_FILE"
else
  log "Using existing .env"
fi

# --------------------------------------------------------------- install -----
if [ ! -d node_modules ]; then
  log "Installing project dependencies"
  bun install
fi

# ------------------------------------------------------------------ run ------
log "Starting dev server on http://localhost:$PORT"
echo "Press Ctrl+C to stop."
exec bun run dev --port "$PORT" --host
