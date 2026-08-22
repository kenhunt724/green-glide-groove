#!/usr/bin/env bash
# Bootstrap an Ubuntu/WSL2 shell on the Omen 45L for this project.
# Safe to re-run: every step is idempotent.

set -euo pipefail

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

log "Checking environment"
if ! grep -qi microsoft /proc/version 2>/dev/null; then
  echo "Note: not running under WSL. Continuing anyway (plain Linux works too)."
fi

log "Updating apt and installing base packages"
sudo apt-get update -y
sudo apt-get install -y \
  build-essential curl git unzip ca-certificates pkg-config \
  ffmpeg python3 python3-venv python3-pip jq

log "Verifying GPU passthrough"
if have nvidia-smi; then
  nvidia-smi || echo "nvidia-smi ran but reported an error — update the Windows NVIDIA driver."
else
  echo "nvidia-smi not found. Install the latest NVIDIA Studio driver on WINDOWS (not inside WSL),"
  echo "then run 'wsl --shutdown' in PowerShell and reopen Ubuntu."
fi

log "Installing Bun (JS runtime + package manager used by this project)"
if have bun; then
  bun upgrade || true
else
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="$HOME/.bun/bin:$PATH"

log "Installing uv (fast Python package manager)"
if have uv; then
  uv self update || true
else
  curl -LsSf https://astral.sh/uv/install.sh | sh
fi
export PATH="$HOME/.local/bin:$PATH"

log "Installing Node.js LTS (some tooling still expects node)"
if ! have node; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

log "Creating the Python data/ML environment at ~/.venvs/eps"
mkdir -p "$HOME/.venvs"
if [ ! -d "$HOME/.venvs/eps" ]; then
  uv venv "$HOME/.venvs/eps"
fi
# shellcheck disable=SC1091
source "$HOME/.venvs/eps/bin/activate"
uv pip install --python "$HOME/.venvs/eps/bin/python" numpy pandas scikit-learn matplotlib
deactivate

log "Wiring PATH into ~/.bashrc"
add_line() { grep -qxF "$1" "$HOME/.bashrc" || echo "$1" >> "$HOME/.bashrc"; }
add_line 'export PATH="$HOME/.bun/bin:$PATH"'
add_line 'export PATH="$HOME/.local/bin:$PATH"'
add_line 'alias eps-py="source $HOME/.venvs/eps/bin/activate"'

log "Installing project dependencies (if run from the repo root)"
if [ -f package.json ]; then
  "$HOME/.bun/bin/bun" install
  if [ -f remotion/package.json ]; then
    (cd remotion && "$HOME/.bun/bin/bun" install)
  fi
else
  echo "No package.json here — clone the repo, cd into it, and run 'bun install'."
fi

log "Versions installed"
printf 'bun    : %s\n' "$("$HOME/.bun/bin/bun" --version 2>/dev/null || echo missing)"
printf 'node   : %s\n' "$(node --version 2>/dev/null || echo missing)"
printf 'python : %s\n' "$(python3 --version 2>/dev/null || echo missing)"
printf 'uv     : %s\n' "$(uv --version 2>/dev/null || echo missing)"
printf 'ffmpeg : %s\n' "$(ffmpeg -version 2>/dev/null | head -n1 || echo missing)"
printf 'git    : %s\n' "$(git --version 2>/dev/null || echo missing)"

log "Done"
cat <<'EOF'

Next steps:
  1. Close and reopen this terminal (so PATH updates apply).
  2. bun run dev          # app on http://localhost:8080
  3. eps-py               # activate the Python ML environment
  4. Optional local models:  curl -fsSL https://ollama.com/install.sh | sh

Keep your code in the Linux filesystem (~/eps), NOT /mnt/c/... — it is far faster.
EOF
