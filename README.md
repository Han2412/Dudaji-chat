# Dudaji-chat

A full-stack web chat application built with **React.js**, **Vite**, and **Node.js**.

## 🚀 Features

- List and create chat rooms
- Join chat rooms
- Real-time messaging in rooms
- **Bonus:** File transfer in chat rooms
- **Bonus:** Video conferencing (WebRTC)

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js, MongoDB
- **Styling:** Tailwind CSS
- **Linting:** ESLint, Prettier
- **Version Control:** Git, GitHub
- **Deployment:** Vercel (frontend), Render (backend)

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Han2412/Dudaji-chat.git
cd dudaji-chat
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Start development servers

**Frontend:**

```bash
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the app.

**Backend:**

```bash
cd backend
npm start
```

The backend runs at [http://localhost:5000](http://localhost:5000).

## 📁 Project Structure

```
frontend/
├── node_modules/      # Dependency files
├── src/               # Source code
│   ├── assets/        # Static assets (e.g., vite.svg)
│   ├── component/     # React components
│   │   ├── Auth.jsx   # Authentication component
│   │   ├── ChatArea.jsx # Chat area component
│   │   ├── ChatHeader.jsx # Chat header component
│   │   ├── MessageInput.jsx # Message input component
│   │   ├── MessageList.jsx # Message list component
│   │   └── Sidebar.jsx # Sidebar navigation
│   ├── App.jsx        # Main app component
│   ├── App.css        # App styles
│   ├── index.css      # Global styles
│   ├── index.html     # HTML entry point
│   └── main.jsx       # JS entry point
├── .eslint.config.js  # ESLint configuration
├── package.json       # Project metadata and scripts
├── package-lock.json  # Lock file for dependencies
├── vite.config.js     # Vite configuration
└── README.md          # This file
```

## 🧪 Linting

Run ESLint to check code style:

```bash
npm run lint
```

## 🌐 Deployment

- **Frontend:** [Dudaji Chat on Vercel](https://dudaji-chat-jrbw.vercel.app/)
- **Backend:** [Chat Backend on Render](https://chat-backend-1n0t.onrender.com/)

## 🤝 Contributing

1. Fork the repo  
2. Create your feature branch (`git checkout -b feature/feature-name`)  
3. Commit your changes (`git commit -m 'Add some feature'`)  
4. Push to the branch (`git push origin feature/feature-name`)  
5. Open a Pull Request

