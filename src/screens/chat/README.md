# Group Chat Feature

This document provides an overview of the group chat functionality implemented in the SnapClone app.

## Overview

The group chat feature allows users to create and participate in group conversations with multiple friends. Users can create groups, add friends to groups, send messages to the group, and view group members.

## Components

### 1. CreateGroupChatScreen

Located at `src/screens/chat/CreateGroupChatScreen.js`, this screen allows users to:
- Enter a group name
- Select friends to add to the group
- Create the group chat

### 2. ChatDetailScreen

Located at `src/screens/chat/ChatDetailScreen.js`, this screen has been updated to:
- Display group chat messages
- Show sender names for group messages
- Display system messages (e.g., when a group is created)
- Show a list of group participants
- Handle sending messages to group chats

### 3. ChatScreen

Located at `src/screens/main/ChatScreen.js`, this screen has been updated to:
- Display both direct and group chats
- Show group chat icons and names
- Provide a button to create new group chats

## Database Structure

Group chats are stored in the Firestore database with the following structure:

```
chats/
  {chatId}/
    name: string                // Group name
    type: string                // "group" for group chats
    createdBy: string           // User ID of the creator
    createdAt: timestamp        // When the group was created
    participants: array          // Array of user IDs
    participantNames: object     // Map of user IDs to display names
    lastMessage: string         // Last message text
    lastMessageTimestamp: timestamp
    lastMessageSenderId: string // User ID of the last message sender
    unreadCounts: object        // Map of user IDs to unread message counts
    messages/
      {messageId}/
        text: string            // Message text
        senderId: string        // User ID of the sender
        senderName: string      // Display name of the sender
        timestamp: timestamp    // When the message was sent
        read: boolean           // Whether the message has been read
        type: string            // "text", "image", "system", etc.
```

## Notifications

The notification system has been updated to support group chat notifications:

1. **Group Invite Notifications**: When a user is added to a group, they receive a notification.
2. **Group Message Notifications**: When a message is sent to a group, all participants except the sender receive a notification.

## UI Elements

- **Group Chat Icon**: A custom icon for group chats, located at `assets/group-chat-icon.png`
- **Participants List**: A modal that shows all group members
- **System Messages**: Special messages that appear when a group is created or when members join/leave

## Future Enhancements

Potential improvements to the group chat feature:

1. **Group Management**: Allow users to add/remove members, change group name, and leave groups
2. **Group Roles**: Implement admin/moderator roles for group management
3. **Group Media**: Support for sharing images and videos in group chats
4. **Group Settings**: Allow users to customize notification settings for specific groups
5. **Group Search**: Search functionality for finding specific messages in group chats 