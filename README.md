# TaskFlow Native

TaskFlow Native is a mobile-first task management application built using React Native (Expo) for the frontend and Go (Golang) for the backend. The project follows a clean API-driven architecture and is designed for performance, scalability, and maintainability.

---

## Overview

This project is a mobile adaptation of an existing web-based task management system, redesigned to provide an optimized mobile user experience while maintaining core functionality.

---

## Features

* Create, update, and delete tasks
* View and manage task lists
* API-driven communication between frontend and backend
* Mobile-optimized user interface
* Lightweight and efficient architecture

---

## Project Structure

```
root/
├── taskflow-mobile/   # React Native (Expo) application
├── backend/           # Go backend API
├── README.md
```

---

## Mobile Application (Expo)

### Setup

```
cd taskflow-mobile
npm install
npx expo start
```

### Running the Application

Use Expo Go on a mobile device or an emulator to run the application by scanning the QR code generated after starting the development server.

---

## Backend (Go)

### Setup

```
cd backend
go mod tidy
go run main.go
```

---

## API Configuration

Ensure the mobile application points to the correct backend server by configuring the base URL:

```
const BASE_URL = "http://<YOUR_LOCAL_IP>:<PORT>";
```

---

## Building the Android APK

```
cd taskflow-mobile
npx eas build -p android --profile preview
```

---

## Technology Stack

* React Native (Expo)
* Go (Golang)
* RESTful APIs
* Expo Router

---

## Future Enhancements

* User authentication and authorization
* Cloud deployment
* Push notifications
* Advanced task filtering and analytics

---

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with your changes.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

This project was developed as part of learning and exploring mobile application development with React Native and backend systems using Go.

