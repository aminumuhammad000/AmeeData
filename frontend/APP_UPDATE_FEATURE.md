# App Update Notification Feature

## Overview
This feature allows admins to notify users about new app releases and prompt them to update directly from within the app.

## How It Works

### For Admins

1. **Access the Admin Panel**
   - Open the app and navigate to **Profile** tab
   - Tap the **Settings** icon (gear icon) in the top right
   - Scroll down to the **Admin Panel** section (only visible to admin users)
   - Tap **Push Notifications**

2. **Send App Update Notification**
   - Select **"App Update"** as the notification type
   - The title and message will be pre-filled with a default update message
   - Customize the message if needed
   - **Important**: Add the Play Store or download URL in the **Action URL** field
     - Example: `https://play.google.com/store/apps/details?id=com.yourapp`
   - Tap **Send Broadcast**

3. **Alternative Access**
   - You can also access Push Notifications from **Admin Users** screen
   - Tap the notification bell icon in the header

### For Users

1. **Automatic Detection**
   - When users open the app, it automatically checks for update notifications
   - If an app update notification exists, a popup modal appears

2. **Update Popup**
   - Shows the update title and message from the admin
   - Displays two options:
     - **Update Now**: Opens the Play Store or download link
     - **Remind Me Later**: Dismisses the popup (will show again on next app launch)

3. **Updating the App**
   - Tapping "Update Now" opens the link in the device's browser
   - User can download and install the new version

## Technical Details

### Components Created
- `AppUpdateChecker.tsx`: Modal component that checks for and displays update notifications
- `AdminNotificationsScreen.tsx`: Admin interface for sending broadcast notifications

### Backend Integration
- Uses `/admin/notifications/broadcast` endpoint to send notifications
- Notifications are stored with type `app_update` and high priority
- The `action_url` field contains the download/store link

### Files Modified
- `app/_layout.tsx`: Added AppUpdateChecker component
- `app/settings.tsx`: Added Admin Panel section
- `services/admin.service.ts`: Added sendBroadcastNotification method
- `screens/AdminUsersScreen.tsx`: Added notification bell icon

## Best Practices

1. **Always include the Action URL** - Without it, users can't download the update
2. **Test the link** - Make sure the Play Store or download link works before sending
3. **Clear messaging** - Explain what's new and why users should update
4. **Timing** - Send update notifications when you've verified the new version is live

## Example Notification

**Title**: New App Update Available!

**Message**: A new version of the app is available. Please update now for the latest features and improvements.

**Action URL**: `https://play.google.com/store/apps/details?id=com.vtuapp`

**Type**: App Update

**Priority**: High
