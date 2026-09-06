#!/usr/bin/env bash
# Install Owncast (live streaming server) on the Omen and keep it running on reboot.
#
#   bash docs/omen-setup/install-owncast.sh
#
# After it finishes:
#   - Admin panel : http://localhost:8090/admin   (user: admin, password: abc123 -> CHANGE IT)
#   - RTMP ingest : rtmp://localhost:1935/live    (stream key set in the admin panel)
#   - Public site : http://localhost:8090
#
# Safe to re-run.

set -euo pipefail

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

OWNCAST_DIR="${OWNCAST_DIR:-$HOME/owncast}"
OWNCAST_PORT="${OWNCAST_PORT:-8090}"
RTMP_PORT="${RTMP_PORT:-1935}"

log "Installing prerequisites"
sudo apt-get update -y
sudo apt-get install -y curl unzip ffmpeg ca-certificates

log "Installing Owncast into $OWNCAST_DIR"
mkdir -p "$OWNCAST_DIR"
cd "$OWNCAST_DIR"
if [ ! -x "$OWNCAST_DIR/owncast" ] && [ ! -x "$OWNCAST_DIR/owncast/owncast" ]; then
  curl -sL https://owncast.online/install.sh | bash
else
  echo "Owncast binary already present — leaving it in place."
  echo "To upgrade later: cd $OWNCAST_DIR && curl -sL https://owncast.online/install.sh | bash"
fi

# The installer sometimes unpacks into a nested folder — find the real binary.
if [ -x "$OWNCAST_DIR/owncast" ] && [ ! -d "$OWNCAST_DIR/owncast" ]; then
  OWNCAST_BIN="$OWNCAST_DIR/owncast"
  OWNCAST_HOME="$OWNCAST_DIR"
elif [ -x "$OWNCAST_DIR/owncast/owncast" ]; then
  OWNCAST_BIN="$OWNCAST_DIR/owncast/owncast"
  OWNCAST_HOME="$OWNCAST_DIR/owncast"
else
  echo "Could not find the Owncast program inside $OWNCAST_DIR" >&2
  exit 1
fi
echo "Using Owncast program at: $OWNCAST_BIN"

log "Creating the systemd service (auto-start on reboot)"
SERVICE=/etc/systemd/system/owncast.service
sudo tee "$SERVICE" >/dev/null <<EOF
[Unit]
Description=Owncast live streaming server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$OWNCAST_HOME
ExecStart=$OWNCAST_BIN -webserverport $OWNCAST_PORT -rtmpport $RTMP_PORT
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

if have systemctl && [ -d /run/systemd/system ]; then
  sudo systemctl daemon-reload
  sudo systemctl enable owncast
  sudo systemctl restart owncast
  sleep 3
  sudo systemctl --no-pager --lines=10 status owncast || true
else
  log "systemd is not active in this shell"
  cat <<'EOF'
WSL only starts systemd when it is switched on. Enable it once:

  sudo tee /etc/wsl.conf >/dev/null <<'CONF'
[boot]
systemd=true
CONF

Then, from Windows PowerShell:  wsl --shutdown
Reopen Ubuntu and re-run this script.
EOF
fi

log "Done"
cat <<EOF

Next:
  1. Open  http://localhost:$OWNCAST_PORT/admin  (admin / abc123) and change the password
     and the stream key immediately.
  2. In OBS: Settings -> Stream -> Custom...
       Server    : rtmp://localhost:$RTMP_PORT/live
       Stream key: the key from the admin panel
  3. Expose it safely with:  bash docs/omen-setup/cloudflare-tunnel.sh

Handy commands:
  sudo systemctl status owncast
  sudo systemctl restart owncast
  journalctl -u owncast -f
EOF
