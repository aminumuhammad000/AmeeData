#!/bin/bash
#
# One-time setup script for MongoDB auto-backup
# Run this on your VPS with: sudo bash setup_backup.sh
#

set -euo pipefail

echo "=================================="
echo "  MongoDB Auto-Backup Setup"
echo "=================================="

# Step 1: Install MongoDB Database Tools
echo ""
echo "[1/5] Installing MongoDB Database Tools..."
if command -v mongodump &> /dev/null; then
    echo "  ✅ mongodump already installed: $(mongodump --version 2>&1 | head -1)"
else
    apt update
    apt install -y mongodb-database-tools
    echo "  ✅ mongodump installed: $(mongodump --version 2>&1 | head -1)"
fi

# Step 2: Install rclone
echo ""
echo "[2/5] Installing rclone..."
if command -v rclone &> /dev/null; then
    echo "  ✅ rclone already installed: $(rclone version 2>&1 | head -1)"
else
    curl https://rclone.org/install.sh | bash
    echo "  ✅ rclone installed: $(rclone version 2>&1 | head -1)"
fi

# Step 3: Create backup directory
echo ""
echo "[3/5] Creating backup directory..."
mkdir -p /var/backups/mongodb
chmod 755 /var/backups/mongodb
echo "  ✅ Created /var/backups/mongodb"

# Step 4: Install backup script
echo ""
echo "[4/5] Installing backup script..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "${SCRIPT_DIR}/mongo_backup.sh" /usr/local/bin/mongo_backup.sh
chmod +x /usr/local/bin/mongo_backup.sh
echo "  ✅ Installed to /usr/local/bin/mongo_backup.sh"

# Step 5: Set up cron job (daily at 2 AM)
echo ""
echo "[5/5] Setting up cron job..."
CRON_JOB="0 2 * * * /usr/local/bin/mongo_backup.sh >> /var/log/mongo_backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "mongo_backup.sh"; then
    echo "  ⚠️  Cron job already exists, skipping..."
else
    (crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -
    echo "  ✅ Cron job added: runs daily at 2:00 AM"
fi

# Create log file
touch /var/log/mongo_backup.log
chmod 644 /var/log/mongo_backup.log

echo ""
echo "=================================="
echo "  Setup Complete! 🎉"
echo "=================================="
echo ""
echo "⚡ Next steps:"
echo "  1. Configure rclone with Google Drive:"
echo "     rclone config"
echo "     (name your remote 'gdrive')"
echo ""
echo "  2. Test the backup manually:"
echo "     sudo /usr/local/bin/mongo_backup.sh"
echo ""
echo "  3. Check Google Drive → MongoBackups folder"
echo ""
echo "  4. View cron jobs:  crontab -l"
echo "  5. View logs:       tail -f /var/log/mongo_backup.log"
echo ""
