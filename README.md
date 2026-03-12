# Point GIS

Point GIS is a simple **Progressive Web Application (PWA)** for working with geographic points on a map.  
The project consists of a **Go backend API** and a **modern frontend built with Lit, Leaflet, and Vite**.

The client displays a map interface and can be installed as a PWA, while the backend provides API endpoints for data.

---

# Project Structure

point-gis
│
├── client/ # PWA frontend (Lit + Leaflet + Vite)
│
├── server/ # Go backend API (Gin framework)
│
├── LICENSE
└── README.md

---

# Requirements

Before running the project, install the following:

## 1. Node.js

Required for running the frontend.

Recommended version:
Node.js >= 18

Check installation:
node -v
npm -v

Download from:

https://nodejs.org

---

## 2. Go

Required for running the backend server.

Recommended version:
Go >= 1.21

Check installation:
go version

Download from:

https://go.dev

---

# Running the Backend (Server)

Navigate to the server directory:
cd server

Download dependencies:
go mod tidy

Run the server:
go run main.go

The server will start at:
http://localhost:8080

Example API endpoint:
GET http://localhost:8080/albums

---

# Running the Frontend (Client)

Navigate to the client directory:
cd client

Install dependencies:
npm install

Start development server:
npm run dev

The application will run at:
http://localhost:5173

---

# Building the Client

To build the production version:
npm run build

The compiled output will be in:
client/dist

You can preview the production build with:
npm run preview

---

# PWA Features

The client application includes basic **Progressive Web App support**:

- Service Worker
- Offline caching
- Installable on mobile and desktop
- Web App Manifest

Files related to PWA:
manifest.json
sw.js

---

# Technologies Used

## Frontend

- Lit
- Leaflet
- TypeScript
- Vite

## Backend

- Go
- Gin Web Framework

---

# Development Workflow

Run backend:
cd server
go run main.go

Run frontend:
cd client
npm install
npm run dev

Then open:
http://localhost:5173
