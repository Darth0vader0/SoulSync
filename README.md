# SoulSync

## Description

SoulSync is a real-time collaborative platform for sharing resources, messages, and media in channels. Users can join channels, send messages, upload files, and interact with others in a seamless, modern interface. The project features secure authentication, resource sharing, and live updates via sockets.

---

## Flow

### 1. **Authentication**
- **Login/Signup:**  
  - Users land on the login/signup page.
  - On signup, a key pair is generated for secure DMs.

---

### 2. **Sidebar Navigation**
- **Server Icons (Leftmost column):**
  - **Direct Messages (DM) Icon:**  
    - Click to open DM view and see/search users for private chat.
  - **Server Buttons:**  
    - Click a server icon to select it and load its channels.
  - **Create Server (+):**  
    - Opens a dialog to create a new server.
  - **Join Server:**  
    - Opens a dialog to join a server via invite link.

---

### 3. **Channel List (Second column)**
- **Text Channels:**  
  - Click to open chat (ChatBox) for that channel.
- **Voice Channels:**  
  - Click to join a voice channel (Voice UI appears).
- **Resources Channels:**  
  - Click to open the resource sharing interface.

---

### 4. **Main Area**
- **Text Channel:**  
  - Shows chat messages.
  - Input at the bottom to send messages.
- **Voice Channel:**  
  - Shows connected users, volume, and audio controls.
- **Resources Channel:**  
  - Shows shared files/messages grouped by date.
  - **Paperclip:** Upload a file.
  - **Send:** Send message/file.
  - **Download:** Download/view shared file.
  - **X:** Remove selected file before sending.

---

### 5. **Direct Messages (DM)**
- **DM List:**  
  - Click a user to open a private chat.
- **DM Chat:**  
  - Messages are end-to-end encrypted.
  - Input at the bottom to send encrypted messages.

---

### 6. **Other Actions**
- **Invite People:**  
  - In server header, click "Invite" to get a shareable invite link.
- **Settings:**  
  - (Planned) Open user/server settings.

---

### 7. **Logout**
- Accessible from the user menu (not shown in code, but typically present).

---

**Navigation Summary:**
- All navigation is sidebar-driven.
- Each button or menu leads to a specific view (chat, resources, voice, DM).
- Actions like creating/joining servers or channels are handled via dialogs.
---

## Features

- Real-time messaging and resource sharing in channels
- File uploads (images, videos, audio, pdf, etc.)
- Grouped messages by date
- Live updates via WebSockets
- User authentication and secure key management
- Responsive and modern UI with Tailwind CSS and DaisyUI
- Download and preview shared resources
- Channel management (create, join, leave)

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/soulsync.git
   cd soulsync
   
    cd backend
    npm install
    npm run dev
   
    cd ../frontend
    npm install
    npm run dev
