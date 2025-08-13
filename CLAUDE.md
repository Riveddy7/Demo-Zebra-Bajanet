# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Next.js commands:**
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm start` - Start production server 
- `npm run lint` - Run ESLint

**Docker deployment:**
- `docker-compose up --build` - Build and run application on port 8989
- Application runs in production mode with Node.js 20 Alpine

## Architecture Overview

This is a Next.js 15 RFID inventory management system that displays real-time inventory data from Zebra RFID readers.

**Core Architecture:**
- **Frontend**: Next.js App Router with React 19, Material-UI components
- **Backend**: Next.js API routes handling RFID data processing
- **Database**: Firebase Firestore for inventory storage
- **Real-time Updates**: 10-second polling from frontend to backend

**Key Data Flow:**
1. External RFID reader POST data to `/api/rfid` endpoint
2. API stores latest scan in Firestore `inventory/latest-scan` document
3. Frontend polls `/api/inventory` every 10 seconds
4. UI displays RFID tags in Material-UI grid layout

**Authentication & Config:**
- Firebase Admin SDK uses environment variables for service account
- Client Firebase config includes API keys (in `src/lib/firebase.js`)
- Environment variables required: `FIREBASE_*` credentials

**Component Structure:**
- `src/app/page.js`: Main dashboard with Material-UI theme and polling logic
- `src/components/InventoryDisplay.js`: Grid layout for inventory items
- `src/components/InventoryItem.js`: Individual tag display component
- `src/app/api/`: API routes for inventory (`GET`) and RFID updates (`POST`)

**Key Technical Details:**
- Uses `output: 'standalone'` for Docker deployment
- Force dynamic rendering on inventory API route
- Firebase initialized with singleton pattern to prevent re-initialization
- Spanish language strings in UI components