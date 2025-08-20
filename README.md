# Smart Helpdesk

A modern helpdesk system with ticket management, knowledge base, agent suggestions, audit logs, and user authentication.

## Features
- Login/Register
- Ticket List, Ticket Detail, Create Ticket
- Knowledge Base (list, edit, admin only)
- Settings (config)
- Agent suggestion and audit timeline
- Role-based menus and protected routes
- Responsive, accessible UI

## Tech Stack
- **Frontend:** React (Vite), Vanilla CSS
- **Backend:** Node.js, Express, MongoDB
- **Auth:** JWT
- **Containerization:** Docker, Docker Compose

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (for frontend dev)

### Backend Setup
1. Start Docker Desktop.
2. In your project root, run:
   ```
   docker compose up --build
   ```
3. API will be available at `http://localhost:3000`.

### Frontend Setup
1. Open a terminal in the `client` folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. App will be available at `http://localhost:5173` (or next available port).

## Usage
- Register a new user or login.
- Create, view, and manage tickets.
- Edit knowledge base articles (admin only).
- Update settings/configuration.
- Use the navigation bar to switch between pages.

## Folder Structure
```
smart-helpdesk/
  api/         # Backend (Node.js, Express)
  client/      # Frontend (React, Vite)
  docker-compose.yml
  README.md
```

## License
MIT
