# 🔐 Encrypted Chat & File Sharing App

A real-time chat and file-sharing application with end-to-end encryption (RSA & AES) that allows users to communicate and share files securely without login. Users generate a 6-digit room code to join private rooms instantly. It also includes an AI assistant for asking questions within the app.

# 🚀 Features

 - No Login Required → Join with a 6-digit code only.

 - End-to-End Encryption (RSA + AES) → All messages and files are securely encrypted.

 - Real-Time Chat → Send and receive instant messages across devices.

 - File Sharing → Share documents, images, videos, audio, presentations, etc.

 - Cross-Device Sync → Any computer with the same room code can join and access files/messages.

 - AI Assistant → Ask doubts and get instant answers from AI.

 - Secure File Handling → Files are encrypted before transfer and decrypted on download.


# 🏗️ Tech Stack
Frontend (React + Vite)

 - ⚛️ React 19 + React Router v7

 - 🎨 Tailwind CSS 4

 - 🔌 Socket.io Client (real-time communication)

 - 🧵 Zustand (state management)

 - 🔒 Fingerprint.js (client security)

 - 📄 React Markdown + Syntax Highlighter (for AI/code responses)

 - 🔔 React Toastify (notifications)

 - 📡 Axios (API requests)

Backend (Node.js + Express)

 - 🚀 Express 5 + Socket.io (real-time server)

 - 🔒 RSA + AES (end-to-end encryption)

 - 🗄️ MongoDB + Mongoose (database)

 - ☁️ Cloudinary / ImageKit (file storage)

 - 📧 Nodemailer (email notifications)

 - ⏰ Node-cron (scheduled tasks)

 - 🖼️ Sharp (image optimization)

 - 🔑 JWT (secure token handling, if needed)

 - 🤖 Google Generative AI SDK (AI assistant)  

# ⚙️ How It Works

 - Generate Room Code

 - Open the app → Click "Generate 6-digit code" → Share it with others.

 - Join Room

 - Enter the same 6-digit code on any device → Join without login.

- Send Messages & Files

 - Chat in real-time and share files (doc, sheet, ppt, image, video, audio).

 - Encryption

 - Messages: Encrypted using RSA before sending.

 - Files: Encrypted using AES before uploading and securely transferred.

 - AI Assistant

 - Type your question → AI (powered by Google Generative AI) responds instantly.


# 🔐 Security

 - **RSA → Used** for message encryption (public/private keys).

 - **AES → Used** for file encryption/decryption.

 - **No Login** → Privacy-first design, no user accounts required.

 - **End-to-End** Encrypted → Only participants in the room can access messages/files.

# 📌 Future Improvements

 - **Mobile app version** (React Native).

 - **File previews** (image, video, pdf).

 - **More AI integrations** (summarize chat, generate documents).

 - **Offline mode with PWA.**

👨‍💻 Author

Tarapada Garai
🌐 Portfolio