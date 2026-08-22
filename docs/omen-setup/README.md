# Omen 45L Setup — Local Dev + AI Workstation

Turn your HP Omen 45L into a machine that runs this project (and local AI work) the same way the cloud environment does.

Follow the steps in order. Total time: roughly 45–90 minutes, mostly downloads.

---

## 0. The one-command path

If you just want it running, clone the repo and run:

```bash
bash docs/omen-setup/start.sh
```

That installs the whole toolchain (skipping anything already present), prompts once for the three backend values, writes `.env`, installs dependencies, and starts the dev server on http://localhost:8080.

Useful flags: `--skip-bootstrap`, `--reconfigure`, `--port 3000`.

### Even simpler: a desktop shortcut

If you want a true one-click experience from Windows:

1. In File Explorer, go to `docs/omen-setup\` inside your project folder.
2. Right-click `launch-eps.bat` → **Send to → Desktop (create shortcut)**.
3. Optional: right-click the new desktop shortcut → **Rename** it to "Start Earth Resonance Hub".
4. Double-click it.

The first time it runs it will ask you to pick your project folder. After that it remembers the path, opens Windows Terminal running WSL, starts the dev server, and opens `http://localhost:8080` in your browser automatically.

The sections below explain what the scripts do, and what to do if a step fails.

---

## 1. Base OS layer — Windows 11 + WSL2

Keep Windows (you need it for NVIDIA drivers and the Remotion/ffmpeg GPU path) and add a real Linux shell on top.

Open **PowerShell as Administrator**:

```powershell
wsl --install -d Ubuntu
wsl --update
```

Reboot when prompted. On first launch Ubuntu asks for a username and password — this is your Linux account, separate from Windows.

**Driver rule:** install the latest NVIDIA **Studio** driver on Windows only. Never install a GPU driver inside WSL — the GPU passes through automatically and installing one inside Linux breaks it.

---

## 2. Verify the GPU is visible from Linux

Inside the Ubuntu terminal:

```bash
nvidia-smi
```

You should see your GPU, driver version, and VRAM. If this fails, update the Windows driver and run `wsl --shutdown` in PowerShell, then reopen Ubuntu.

---

## 3. Run the bootstrap script

From the Ubuntu shell, inside your cloned copy of this project:

```bash
bash docs/omen-setup/bootstrap-omen.sh
```

It installs: build tools, git, ffmpeg, Bun, uv (Python), Node LTS, and the Python data stack (numpy, pandas, scikit-learn). It is safe to re-run — every step is idempotent.

Close and reopen the terminal afterwards so the new tools land on your PATH.

---

## 4. Get the project running locally

Connect this project to GitHub first (Project settings → GitHub → Connect), then:

```bash
git clone <your-repo-url> eps
cd eps
bun install
bun run dev
```

Open http://localhost:8080 in your Windows browser — WSL forwards the port automatically.

The `.env` values (backend URL and publishable key) are not in git. Copy them from the project's environment into a local `.env` file at the repo root:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

---

## 5. Local AI models (optional but this is the fun part)

**Ollama** is the simplest way to run models on your GPU:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama run qwen2.5-coder:14b
```

Model sizing for a single consumer GPU:

| VRAM  | Comfortable model size          |
|-------|---------------------------------|
| 8 GB  | 7B quantized (q4)               |
| 12 GB | 14B quantized                   |
| 16 GB | 14B q6 / 32B q4 (tight)         |
| 24 GB | 32B quantized comfortably       |

Check yours with `nvidia-smi` (top-right number).

For image/video generation, install **ComfyUI** — it uses the same GPU and gives you the diffusion pipeline locally:

```bash
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
uv venv && source .venv/bin/activate
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
uv pip install -r requirements.txt
python main.py --listen
```

---

## 6. Rendering video locally

The Remotion news package in `remotion/` renders on your machine:

```bash
cd remotion
bun install
bun run scripts/render-remotion.mjs
```

ffmpeg (installed by the bootstrap script) handles the audio mux. Rendering is CPU-heavy; the 45L will chew through it far faster than the cloud sandbox.

---

## 7. Lead-scoring model training

The capacity engine's scorer is small tabular ML — it trains in seconds on CPU, no GPU needed:

```bash
uv venv && source .venv/bin/activate
uv pip install scikit-learn pandas numpy
```

Export your leads to CSV, train, and paste the resulting coefficients back into the app. Your customer data never leaves the Omen.

---

## Daily workflow

```bash
wsl                    # drop into Ubuntu from any Windows terminal
cd ~/eps && bun run dev
ollama serve &         # if you want a local model on tap
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `nvidia-smi` not found in WSL | Update Windows NVIDIA driver, then `wsl --shutdown` |
| Port 8080 unreachable from Windows | `wsl --shutdown`, reopen; check no VPN is intercepting localhost |
| `bun: command not found` after bootstrap | Reopen the terminal, or `source ~/.bashrc` |
| Ollama out-of-memory | Drop to a smaller quant (`:q4_K_M`) or a smaller model |
| Slow file access | Keep code in the Linux filesystem (`~/eps`), never `/mnt/c/...` |
