# TaskFlow Agents Context

This file serves as a quick reference guide containing essential project information for AI agents working on this repository.

## GitHub Repository Details
- **Repository URL:** `https://github.com/its-me-maady/Todo-list-app`
- **Owner:** `its-me-maady`

## Tech Stack Overview
TaskFlow is an offline-first mobile application with a cloud synchronization backend.

### Mobile App (`/taskflow-mobile`)
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Storage:** AsyncStorage (for offline mode)
- **Key Features:** Offline-first architecture, UI with priorities, labels, and local/cloud state syncing.

### Backend (`/backend`)
- **Language:** Go (Golang)
- **Web Framework:** Gin
- **Database:** PostgreSQL (hosted on Aiven Cloud)
- **Database Tools:** `sqlx`, `lib/pq`
- **Security:** JWT Authentication, bcrypt password hashing.

## App Launch Commands

### Running the Backend
```bash
# Navigate to the backend directory and start the Go server
cd backend
go run ./cmd/server/main.go
```
*Note: The backend requires a `.env` file with `DATABASE_URL` and `JWT_SECRET`.*

### Running the Mobile App
```bash
# Navigate to the mobile directory and start the Expo bundler
cd taskflow-mobile
npm start
```
*Note: The frontend requires a `.env` file with `EXPO_PUBLIC_BASE_URL` pointing to the backend.*
