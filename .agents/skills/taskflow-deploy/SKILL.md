---
name: taskflow-deploy
description: >-
  Automates the deployment process for the TaskFlow full-stack application.
  Deploys the Go backend to Render/Railway and the Expo frontend to Web or EAS.
---

# TaskFlow Deployment Skill

## Overview
This skill guides the agent through deploying the TaskFlow application. It provides explicit step-by-step instructions for committing code, pushing the Go backend to trigger cloud deployments, and running Expo CLI commands to build the mobile frontend.

## Dependencies
- `gh` (GitHub CLI) - for checking repo status
- `eas` (Expo Application Services CLI) - for building the mobile apps

## Quick Start
To trigger this skill, the user can prompt:
- "Deploy the TaskFlow app"
- "Build the frontend for web and deploy the backend"
- "Run the taskflow-deploy skill"

## Workflow

### 1. Pre-Deployment Checks
- Check `git status` in the root directory to ensure all changes are committed.
- If there are uncommitted changes, ask the user if they want to commit them before deploying.
- Verify that `EXPO_PUBLIC_BASE_URL` in `taskflow-mobile/.env` is pointing to the production URL, not `localhost`.

### 2. Deploying the Backend
- Since the backend is hosted via GitHub integration (e.g., Render/Railway), deployment is triggered by pushing to the `main` branch.
- Run `git push origin main` (or the default branch).
- Notify the user that the backend deployment has been triggered and will take a few minutes on their cloud provider.

### 3. Deploying the Frontend (Web)
- If the user requested a Web deployment:
  - Navigate to `taskflow-mobile`: `cd taskflow-mobile`
  - Run the export command with cache clearing: `npx expo export -p web -c`
  - Notify the user that the `dist/` folder has been generated and is ready to be uploaded to Netlify/Vercel.

### 4. Deploying the Frontend (Android/iOS via EAS)
- If the user requested a mobile app build:
  - Navigate to `taskflow-mobile`: `cd taskflow-mobile`
  - For Android: Run `eas build -p android --profile preview`
  - Monitor the terminal output and provide the user with the final download link to their `.apk` file.

## Error Handling
- **Metro Cache Issues:** If the build complains about stale `.env` variables, always remind the user or run the export command with the `-c` (clear) flag.
- **EAS Authentication:** If `eas build` fails due to authentication, prompt the user to run `eas login` in their terminal.

## Common Mistakes
- Forgetting to change `EXPO_PUBLIC_BASE_URL` from `localhost` to the production URL before building the frontend.
- Attempting to build an iOS app without an active Apple Developer account.
