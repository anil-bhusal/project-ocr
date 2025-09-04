# OCR Frontend Client

React-based frontend application for OCR document processing with interactive text selection.

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Tanstack Query for data fetching
- Redux Toolkit for state management
- Vitest for testing

## Setup

```bash
# Install dependencies
yarn install
# or
npm install

# Start development server
yarn dev
# or
npm run dev
```

The application will run at http://localhost:5173

## Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn preview      # Preview production build
yarn test         # Run tests
```

## Project Structure

```
src/
├── api/          # API service layer
├── components/   # React components
│   └── OCR/     # OCR-specific components
├── hooks/       # Custom React hooks
├── store/       # Redux store configuration
├── types/       # TypeScript type definitions
└── App.tsx      # Main application component
```

## Environment

The frontend connects to the backend API at http://localhost:5000

To change the API URL, modify the base URL in `src/api/axios-config.ts`

## Testing

Tests are written using Vitest and React Testing Library:

```bash
# Run all tests
yarn test
```

## Building

```bash
# Create production build
yarn build

# The build output will be in the dist/ directory
# Serve it with any static web server
```
