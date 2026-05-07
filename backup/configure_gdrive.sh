#!/bin/bash
#
# Google Drive rclone configuration script
# Uses OAuth2 Client ID/Secret for Google Drive access
#
# Usage on VPS:
#   bash configure_gdrive.sh
#
# Since this is a headless VPS, you'll need to:
#   1. Run this script
#   2. Copy the auth URL to your browser
#   3. Login & authorize
#   4. Paste the verification code back
#

set -euo pipefail

echo "=================================="
echo "  Google Drive Configuration"
echo "=================================="
echo ""

# Load credentials from .env file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [ ! -f "${ENV_FILE}" ]; then
    echo "❌ Error: .env file not found at ${ENV_FILE}"
    echo "Create it with:"
    echo "  GDRIVE_CLIENT_ID=your-client-id"
    echo "  GDRIVE_CLIENT_SECRET=your-client-secret"
    exit 1
fi

source "${ENV_FILE}"

if [ -z "${GDRIVE_CLIENT_ID:-}" ] || [ -z "${GDRIVE_CLIENT_SECRET:-}" ]; then
    echo "❌ Error: GDRIVE_CLIENT_ID and GDRIVE_CLIENT_SECRET must be set in .env"
    exit 1
fi

echo "Using Google Drive OAuth2 credentials from .env"
echo "  Client ID: ${GDRIVE_CLIENT_ID:0:20}..."
echo ""

# Create rclone config directory
mkdir -p ~/.config/rclone

# Check if gdrive remote already exists
if rclone listremotes 2>/dev/null | grep -q "^gdrive:"; then
    echo "⚠️  'gdrive' remote already exists in rclone config."
    read -p "Do you want to reconfigure it? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        echo "Skipping configuration."
        exit 0
    fi
    # Remove existing config
    rclone config delete gdrive 2>/dev/null || true
fi

echo ""
echo "Starting rclone configuration with your credentials..."
echo "======================================================"
echo ""
echo "When prompted:"
echo "  - Scope: choose 1 (Full access)"
echo "  - Service account: leave blank (press Enter)"
echo "  - Auto config: choose N (since this is a headless VPS)"
echo "  - Copy the URL to your browser, login, paste the code back"
echo ""

# Use rclone config create with OAuth2 credentials
rclone config create gdrive drive \
    client_id "${GDRIVE_CLIENT_ID}" \
    client_secret "${GDRIVE_CLIENT_SECRET}" \
    scope "drive" \
    config_is_local false

echo ""
echo "Testing connection..."
if rclone lsd gdrive: 2>&1; then
    echo ""
    echo "✅ Google Drive connected successfully!"
else
    echo ""
    echo "⚠️  Connection test had issues. You may need to complete OAuth2 authorization."
    echo "    Run: rclone config reconnect gdrive:"
fi

echo ""
echo "Creating MongoBackups folder on Google Drive..."
rclone mkdir gdrive:MongoBackups 2>&1 || true
echo "✅ MongoBackups folder ready!"

echo ""
echo "=================================="
echo "  Configuration Complete! 🎉"
echo "=================================="
echo ""
echo "Test a backup now:"
echo "  sudo /usr/local/bin/mongo_backup.sh"
echo ""
echo "Check Google Drive → MongoBackups folder"
echo ""
