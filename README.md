# TaskFlow (Gen-ai-ToDo)

TaskFlow is a modern, offline-first mobile To-Do application built with React Native (Expo) and a robust backend in Go (Golang) backed by a PostgreSQL database on Aiven.

The app is designed to work completely seamlessly in **Offline Mode** out-of-the-box (saving tasks to device local storage) and seamlessly upgrades to **Cloud Mode** when a user creates an account and logs in, securely synchronizing tasks across devices.

## Features

* **Offline-First Capabilities:** Works flawlessly without internet utilizing `AsyncStorage`.
* **Cloud Sync:** Register/Login via JWT authentication to sync tasks with a central PostgreSQL database.
* **Modern UI:** Vibrant design, priority segmentation (HIGH, MEDIUM, LOW, NONE), label filtering, and a clean interface.
* **Resilient Backend:** Built with Go and Gin framework using safe SQL practices (`sqlx`) and bcrypt for secure password hashing.
* **Graceful Degradation:** If your authentication session expires, the app will cleanly fall back to offline mode.

## Project Structure

* `/taskflow-mobile`: The React Native Expo frontend.
* `/backend`: The Go + Gin backend API.
* `.env`: The shared environment configuration file containing the Database connection strings and API URL configurations.

## Architecture & Tech Stack

### Frontend (`/taskflow-mobile`)
* **Framework:** React Native with Expo
* **Language:** TypeScript
* **State Management:** React Hooks (`useReducer`, `useState`, Custom Global Hooks)
* **Local Storage:** `@react-native-async-storage/async-storage`
* **Routing:** Expo Router (`_layout.tsx`, `index.tsx`)

### Backend (`/backend`)
* **Language:** Go (Golang)
* **Web Framework:** [Gin](https://github.com/gin-gonic/gin)
* **Database Driver & Query Builder:** `lib/pq` and `sqlx`
* **Security:** JWT (`golang-jwt`) for stateless session tracking, `bcrypt` for password hashing, and CORS protection natively configured.

## Getting Started

### 1. Environment Setup

Ensure you have a `.env` file at the root of the project (`/Gen-ai-ToDo/.env`) with the following keys:

```env
PORT=8080
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/defaultdb?sslmode=require
EXPO_PUBLIC_BASE_URL=http://localhost:8080
JWT_SECRET=your_super_secret_jwt_key
```

### 2. Running the Backend

Open a terminal and navigate to the backend directory, then start the Go server:

```bash
cd backend
go run ./cmd/server/
```
The backend API will start on `http://localhost:8080` (or whatever `PORT` you specified in `.env`).

### 3. Running the Mobile App

Open a second terminal tab and navigate to the mobile app directory:

```bash
cd taskflow-mobile
npm install
npm start
```
You can press `a` to open the app in an Android Emulator, or `i` for the iOS Simulator. 

*(Note: If testing on a physical device on your local network, ensure your `EXPO_PUBLIC_BASE_URL` in `.env` is updated from `localhost` to your computer's local IP address, for example: `192.168.1.5:8080`)*

## Usage

1. Open the app. You will immediately be in Offline Mode.
2. Add tasks—they will be saved directly to your device storage.
3. Click "Login for Cloud" in the header to register or log into your account.
4. Once authenticated, any tasks created, updated, or deleted will automatically hit the Go API and persist into the Postgres Cloud Database.
