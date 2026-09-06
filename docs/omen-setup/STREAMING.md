# Your own streaming platform on the Omen

Three pieces, each with its own script. Run them in order.

| Piece | What it does | Script |
|---|---|---|
| Owncast | Live streaming + chat (the Twitch/YouTube-Live replacement) | `install-owncast.sh` |
| PeerTube | On-demand video library (the YouTube-uploads replacement) | `install-peertube.sh` |
| Cloudflare Tunnel | Puts both on the internet without opening your home network | `cloudflare-tunnel.sh` |

```bash
bash docs/omen-setup/install-owncast.sh
bash docs/omen-setup/install-peertube.sh
bash docs/omen-setup/cloudflare-tunnel.sh
```

All three install a service so everything comes back automatically after a reboot.

## WSL note: turn systemd on once

Auto-start needs systemd, which WSL leaves off by default:

```bash
sudo tee /etc/wsl.conf >/dev/null <<'CONF'
[boot]
systemd=true
CONF
```

Then in Windows PowerShell: `wsl --shutdown`, reopen Ubuntu, re-run the scripts.

Also make WSL itself start with Windows (Task Scheduler → at log on → `wsl.exe -d Ubuntu -- true`), otherwise the Linux side sleeps until you open a terminal.

## Broadcasting

In OBS: **Settings → Stream → Custom**

- Server: `rtmp://localhost:1935/live`
- Stream key: from the Owncast admin panel (`http://localhost:8090/admin`)

Change the default admin password (`abc123`) before the tunnel goes live.

## Connecting the website

After the tunnel is up, add these to the project environment:

```
VITE_OWNCAST_URL=https://live.earthresonancehub.com
VITE_PEERTUBE_URL=https://video.earthresonancehub.com
OWNCAST_URL=https://live.earthresonancehub.com
PEERTUBE_URL=https://video.earthresonancehub.com
```

The `VITE_` pair drives the player and library on `/live`. The other pair is used by the
uptime checker on the server side.

## Uptime monitoring

The site exposes a checker at:

```
https://earthresonancehub.com/api/public/stream-check?token=YOUR_TOKEN
```

Call it every 5 minutes from any free scheduler (cron-job.org, UptimeRobot, or a cron
entry on the Omen). Each call records a result and posts an alert when a service goes
down or comes back.

Two optional project secrets:

- `STREAM_CHECK_TOKEN` — stops strangers triggering the check. If it is unset, the
  endpoint is open.
- `STREAM_ALERT_WEBHOOK_URL` — a Slack/Discord/e-mail-relay webhook. Down and recovery
  alerts are POSTed there as `{"text": "..."}`.

A cron entry on the Omen itself:

```bash
crontab -e
# every 5 minutes
*/5 * * * * curl -s "https://earthresonancehub.com/api/public/stream-check?token=YOUR_TOKEN" >/dev/null
```

Results appear on the public status page at `/status`, measured against the 99.5%
commitment in the Sovereign Media Utility Agreement.

## Hardware guidance

- Owncast transcodes with the CPU by default. On the Omen, switch the video codec to
  **NVIDIA NVENC** in the admin panel — the GPU handles several bitrate variants at once
  and leaves the CPU free.
- PeerTube's transcoding queue is CPU-heavy. Cap concurrency to 1–2 jobs in
  Administration → Configuration → Transcoding so live streaming stays smooth while
  uploads process.
- Keep both data folders on the Linux filesystem (`~/owncast`, `~/peertube`), never on
  `/mnt/c/...`.
