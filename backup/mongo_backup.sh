#!/bin/bash
#
# MongoDB Auto-Backup Script for connecta_vtu
# Runs daily via cron, uploads to Google Drive via rclone
#

set -euo pipefail

# ===== Configuration =====
DB_NAME="connecta_vtu"
MONGO_URI="mongodb://127.0.0.1:27017/${DB_NAME}"
BACKUP_BASE="/var/backups/mongodb"
RCLONE_REMOTE="gdrive:MongoBackups"
RETENTION_DAYS=7
LOG_PREFIX="[mongo_backup]"

# ===== Timestamp =====
DATE=$(date +"%Y-%m-%d_%H-%M")
BACKUP_DIR="${BACKUP_BASE}/mongo_${DATE}"
ARCHIVE_FILE="${BACKUP_BASE}/mongo_${DATE}.tar.gz"

echo "${LOG_PREFIX} ===== Starting backup at $(date) ====="

# Step 1: MongoDB dump
echo "${LOG_PREFIX} Running mongodump for database: ${DB_NAME}..."
mongodump --uri="${MONGO_URI}" --out="${BACKUP_DIR}"
echo "${LOG_PREFIX} Dump complete: ${BACKUP_DIR}"

# Step 2: Compress backup
echo "${LOG_PREFIX} Compressing backup..."
tar -czf "${ARCHIVE_FILE}" -C "${BACKUP_BASE}" "mongo_${DATE}"
echo "${LOG_PREFIX} Archive created: ${ARCHIVE_FILE}"

# Step 3: Upload to Google Drive
echo "${LOG_PREFIX} Uploading to Google Drive..."
rclone copy "${ARCHIVE_FILE}" "${RCLONE_REMOTE}" --progress
echo "${LOG_PREFIX} Upload complete!"

# Step 4: Remove raw dump folder (keep archive)
rm -rf "${BACKUP_DIR}"
echo "${LOG_PREFIX} Cleaned up raw dump folder"

# Step 5: Remove local archives older than retention period
DELETED=$(find "${BACKUP_BASE}" -type f -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "${LOG_PREFIX} Removed ${DELETED} archives older than ${RETENTION_DAYS} days"

echo "${LOG_PREFIX} ===== Backup completed successfully at $(date) ====="
