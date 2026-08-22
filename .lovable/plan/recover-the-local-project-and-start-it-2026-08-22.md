# Recover the local project and start it

## Steps

1. Cancel any active Git prompt with **Ctrl+C**.
2. Return to the Linux home folder:
   ```bash
   cd ~
   ```
3. Confirm the project folder exists:
   ```bash
   ls
   ```
4. If `green-glide-groove` is listed, enter it:
   ```bash
   cd green-glide-groove
   ```
5. Correct the GitHub address:
   ```bash
   git remote set-url origin https://github.com/kenhunt724/green-glide-groove.git
   ```
6. Download the latest project files:
   ```bash
   git pull
   ```
7. Start the setup:
   ```bash
   bash docs/omen-setup/start.sh
   ```

## If the folder is not listed

Clone a fresh copy, then enter it:

```bash
git clone https://github.com/kenhunt724/green-glide-groove.git
cd green-glide-groove
bash docs/omen-setup/start.sh
```

Enter each command **one line at a time**, pressing Enter after each line.
