#!/usr/bin/env bash
# Install PeerTube (on-demand video library) on the Omen with Docker, and keep it
# running on reboot.
#
#   bash docs/omen-setup/install-peertube.sh
#
# After it finishes:
#   - Library : http://localhost:9000
#   - Login   : root  (password printed by: docker compose logs peertube | grep -i "User password")
#
# Safe to re-run.

set -euo pipefail

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

PT_DIR="${PT_DIR:-$HOME/peertube}"
PT_HOSTNAME="${PT_HOSTNAME:-video.earthresonancehub.com}"
PT_PORT="${PT_PORT:-9000}"

log "Installing Docker if needed"
if ! have docker; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER" || true
  echo "Added $USER to the docker group — log out and back in if docker says 'permission denied'."
fi

log "Preparing $PT_DIR"
mkdir -p "$PT_DIR/docker-volume"
cd "$PT_DIR"

rand() { openssl rand -hex 24; }

if [ ! -f .env ]; then
  log "Generating passwords and .env"
  cat > .env <<EOF
POSTGRES_USER=peertube
POSTGRES_PASSWORD=$(rand)
POSTGRES_DB=peertube
PEERTUBE_DB_USERNAME=peertube
PEERTUBE_DB_PASSWORD=\${POSTGRES_PASSWORD}
PEERTUBE_DB_HOSTNAME=postgres
PEERTUBE_WEBSERVER_HOSTNAME=$PT_HOSTNAME
PEERTUBE_WEBSERVER_PORT=443
PEERTUBE_WEBSERVER_HTTPS=true
PEERTUBE_TRUST_PROXY=["127.0.0.1","loopback","172.16.0.0/12"]
PEERTUBE_SECRET=$(rand)
PEERTUBE_REDIS_HOSTNAME=redis
PEERTUBE_SMTP_DISABLED=true
EOF
  chmod 600 .env
else
  echo ".env already exists — keeping your existing credentials."
fi

if [ ! -f docker-compose.yml ]; then
  log "Writing docker-compose.yml"
  cat > docker-compose.yml <<EOF
services:
  postgres:
    image: postgres:15-alpine
    restart: always
    env_file: .env
    volumes:
      - ./docker-volume/db:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - ./docker-volume/redis:/data

  peertube:
    image: chocobozzz/peertube:production-bookworm
    restart: always
    env_file: .env
    environment:
      PEERTUBE_SECRET: \${PEERTUBE_SECRET}
    ports:
      - "$PT_PORT:9000"
      - "1936:1935"
    volumes:
      - ./docker-volume/data:/data
      - ./docker-volume/config:/config
    depends_on:
      - postgres
      - redis
EOF
fi

log "Starting PeerTube"
docker compose up -d

log "Creating the systemd unit (auto-start on reboot)"
sudo tee /etc/systemd/system/peertube.service >/dev/null <<EOF
[Unit]
Description=PeerTube on-demand video library
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=$PT_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
EOF

if [ -d /run/systemd/system ]; then
  sudo systemctl daemon-reload
  sudo systemctl enable peertube
else
  echo "systemd not active — see install-owncast.sh for how to switch it on in WSL."
fi

log "Done"
cat <<EOF

Get the first-run root password with:
  cd $PT_DIR && docker compose logs peertube | grep -i "User password"

Then open http://localhost:$PT_PORT and sign in as 'root'.

Important: PeerTube must know its public hostname. This install used:
  $PT_HOSTNAME
If you use a different one, edit PEERTUBE_WEBSERVER_HOSTNAME in $PT_DIR/.env and run:
  cd $PT_DIR && docker compose up -d --force-recreate
EOF
