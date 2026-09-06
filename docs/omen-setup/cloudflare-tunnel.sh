#!/usr/bin/env bash
# Publish the Omen's streaming services on the internet WITHOUT opening a single
# port on your home router, using a Cloudflare Tunnel.
#
#   bash docs/omen-setup/cloudflare-tunnel.sh
#
# It maps:
#   live.earthresonancehub.com   -> http://localhost:8090   (Owncast)
#   video.earthresonancehub.com  -> http://localhost:9000   (PeerTube)
#
# Requirements: the domain's nameservers must be on Cloudflare (free plan is fine).
# Safe to re-run.

set -euo pipefail

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

TUNNEL_NAME="${TUNNEL_NAME:-eps-omen}"
LIVE_HOST="${LIVE_HOST:-live.earthresonancehub.com}"
VIDEO_HOST="${VIDEO_HOST:-video.earthresonancehub.com}"
OWNCAST_PORT="${OWNCAST_PORT:-8090}"
PT_PORT="${PT_PORT:-9000}"

log "Installing cloudflared"
if ! have cloudflared; then
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg |
    sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" |
    sudo tee /etc/apt/sources.list.d/cloudflared.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y cloudflared
fi

log "Signing in to Cloudflare (a browser window / URL will appear)"
if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
  cloudflared tunnel login
else
  echo "Already signed in."
fi

log "Creating the tunnel '$TUNNEL_NAME'"
if ! cloudflared tunnel list | grep -q " $TUNNEL_NAME "; then
  cloudflared tunnel create "$TUNNEL_NAME"
fi
TUNNEL_ID="$(cloudflared tunnel list | awk -v n="$TUNNEL_NAME" '$2==n {print $1}' | head -n1)"
[ -n "$TUNNEL_ID" ] || { echo "Could not determine the tunnel id." >&2; exit 1; }

log "Writing the tunnel config"
mkdir -p "$HOME/.cloudflared"
cat > "$HOME/.cloudflared/config.yml" <<EOF
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $LIVE_HOST
    service: http://localhost:$OWNCAST_PORT
  - hostname: $VIDEO_HOST
    service: http://localhost:$PT_PORT
    originRequest:
      # Video uploads and long playlists need generous limits.
      connectTimeout: 30s
      noTLSVerify: true
  - service: http_status:404
EOF

log "Pointing DNS at the tunnel"
cloudflared tunnel route dns "$TUNNEL_NAME" "$LIVE_HOST" || true
cloudflared tunnel route dns "$TUNNEL_NAME" "$VIDEO_HOST" || true

log "Installing the tunnel as a service (auto-start on reboot)"
sudo cloudflared --config "$HOME/.cloudflared/config.yml" service install || true
if [ -d /run/systemd/system ]; then
  sudo systemctl enable cloudflared
  sudo systemctl restart cloudflared
  sleep 3
  sudo systemctl --no-pager --lines=10 status cloudflared || true
else
  echo "systemd not active — see install-owncast.sh for how to switch it on in WSL."
fi

log "Done"
cat <<EOF

Your endpoints (HTTPS is handled by Cloudflare, no certificates to manage):
  https://$LIVE_HOST    -> Owncast
  https://$VIDEO_HOST   -> PeerTube

Nothing is exposed on your router. Your home IP address is never published.

NOTE ON RTMP: Cloudflare Tunnel carries HTTP(S) only, so OBS must push to the Omen
locally: rtmp://localhost:1935/live . That is the normal setup — you broadcast from
the same machine (or the same LAN, using the Omen's LAN IP).

Tell the website about these addresses by adding to your project environment:
  VITE_OWNCAST_URL=https://$LIVE_HOST
  VITE_PEERTUBE_URL=https://$VIDEO_HOST
  OWNCAST_URL=https://$LIVE_HOST
  PEERTUBE_URL=https://$VIDEO_HOST

Troubleshooting:
  journalctl -u cloudflared -f
  cloudflared tunnel info $TUNNEL_NAME
EOF
