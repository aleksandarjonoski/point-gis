# Point GIS

Point GIS is a simple **Progressive Web Application (PWA)** for working with geographic points on a map.  
The project consists of a **Go backend API** and a **modern frontend built with Lit, Leaflet, and Vite**.

The client displays a map interface and can be installed as a PWA, while the backend provides API endpoints for data.


# Requirements

Before running the project, install the following:

## 1. Node.js

Required for running the frontend.

Recommended version:<br>
**Node.js >= 18**

Check installation:<br>
**node -v<br>**
**npm -v**

Download from:<br>
https://nodejs.org



## 2. Go

Required for running the backend server.

Recommended version:<br>
**Go >= 1.21**

Check installation:<br>
**go version**

Download from:<br>
https://go.dev



# Running the Backend (Server)

Navigate to the server directory:<br>
**cd server**

Download dependencies:<br>
**go mod tidy**

Run the server:<br>
**go run main.go**

The server will start at:<br>
http://localhost:8080

Example API endpoint:<br>
GET http://localhost:8080/albums



# Running the Frontend (Client)

Navigate to the client directory:<br>
**cd client**

Install dependencies:<br>
**npm install**

Start development server:<br>
**npm run dev**

The application will run at:<br>
http://localhost:5173



# Building the Client

To build the production version:<br>
**npm run build**

The compiled output will be in:<br>
**client/dist**

You can preview the production build with:<br>
**npm run preview**


# PWA Features

The client application includes basic **Progressive Web App support**:

- Service Worker
- Offline caching
- Installable on mobile and desktop
- Web App Manifest

Files related to PWA:
**manifest.json**
**sw.js**



# Technologies Used

## Frontend

- Lit
- Leaflet
- TypeScript
- Vite

## Backend

- Go
- Gin Web Framework



# Development Workflow

Run backend:<br>
**cd server**<br>
**go run main.go**

Run frontend:<br>
**cd client**<br>
**npm install**<br>
**npm run dev**<br>

Then open:<br>
http://localhost:5173
