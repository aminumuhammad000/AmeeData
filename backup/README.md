# MongoDB Auto-Backup Setup

Automatic daily backups of the `connecta_vtu` database → compressed → uploaded to Google Drive.

## What's Included

| File | Purpose |
|------|---------|
| `mongo_backup.sh` | Main backup script (runs daily via cron) |
| `setup_backup.sh` | One-time setup (installs tools + cron job) |
| `configure_gdrive.sh` | Google Drive rclone configuration helper |

## Quick Deploy on VPS

### 1. Copy this folder to your VPS

```bash
scp -r backup/ user@your-vps-ip:~/backup/
```

### 2. Run setup

```bash
cd ~/backup
sudo bash setup_backup.sh
```

This installs `mongodump`, `rclone`, creates backup directory, copies the backup script, and adds a cron job (daily at 2 AM).

### 3. Configure Google Drive

Your OAuth2 credentials are already embedded in the script.
```bash
bash configure_gdrive.sh
```
Follow the prompts — it will give you a URL to open in your browser, login to Google, and paste the auth code back.

### 4. Test it

```bash
sudo /usr/local/bin/mongo_backup.sh
```

Check Google Drive → `MongoBackups` folder for the archive.

### 5. Monitor

```bash
# View cron schedule
crontab -l

# Watch backup logs
tail -f /var/log/mongo_backup.log
```

## Backup Details

- **Schedule**: Daily at 2:00 AM
- **Database**: `connecta_vtu` (`mongodb://127.0.0.1:27017`)
- **Local retention**: 7 days (older archives auto-deleted)
- **Remote**: Google Drive → `MongoBackups/` folder
- **Archive format**: `mongo_YYYY-MM-DD_HH-MM.tar.gz`
