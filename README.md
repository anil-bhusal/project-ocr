# OCR Document Processor

A web application for extracting text from images using OCR technology. Built with React frontend and NestJS backend.

## Features

- Upload images for OCR processing
- Interactive text selection and highlighting
- Edit extracted text with floating input
- Zoom controls for better visibility

## Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- OCR.space API key (free registration at https://ocr.space/ocrapi)

## Installation

### Backend Setup

```bash
cd server

# Using yarn
yarn install

# Or using npm
npm install

# Create .env file
cp .env.example .env

# Add your OCR API key to .env file
# OCR_API_KEY=your_api_key_here
```

### Frontend Setup

```bash
cd client

# Using yarn
yarn install

# Or using npm
npm install
```

## Running the Application

### Start Backend Server

```bash
cd server

# Using yarn
yarn start:dev

# Or using npm
npm run start:dev
```

The backend runs at http://localhost:5000

API documentation available at http://localhost:5000/api-docs

### Start Frontend

```bash
cd client

# Using yarn
yarn dev

# Or using npm
npm run dev
```

The frontend runs at http://localhost:5173

## Usage

1. Open the application in your browser
2. Click "Choose File" or drag and drop an image
3. Wait for OCR processing to complete
4. Interact with the extracted text:
   - Hover over words to highlight them
   - Click to select individual words
   - Double-click to select entire lines
   - Drag to select text areas
   - Use Shift+click for range selection
   - Use Ctrl/Cmd+click for multi-selection

## API Endpoints

### POST /ocr/upload-enhanced
Upload an image for OCR processing with word-level positioning data.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OCR processing completed successfully",
  "data": {
    "words": [
      {
        "text": "word",
        "left": 100,
        "top": 50,
        "width": 60,
        "height": 20,
        "wordId": 1,
        "lineId": 0,
        "confidence": 0.95
      }
    ]
  }
}
```

## Testing

```bash
# Backend tests
cd server
yarn test        # or npm test

# Frontend tests
cd client
yarn test        # or npm test
```

## Production Build

### Backend
```bash
cd server
yarn build       # or npm run build
yarn start:prod  # or npm run start:prod
```

### Frontend
```bash
cd client
yarn build       # or npm run build
# Serve the dist folder with a web server
```

## Docker Support

The project includes Docker configuration for containerized deployment:

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration

To run with Docker:
```bash
docker-compose up -d
```

## Project Structure

```
OCR/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── api/          # API service layer
│   │   └── types/        # TypeScript definitions
│   └── package.json
├── server/                # NestJS backend
│   ├── src/
│   │   ├── ocr/         # OCR module
│   │   ├── common/      # Shared utilities
│   │   └── main.ts      # Application entry
│   └── package.json
└── README.md
```

## Environment Variables

### Server (.env)
```
OCR_API_KEY=your_ocr_space_api_key
OCR_API_URL=https://api.ocr.space/parse/image
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### OCR API Issues
- Verify your API key is correct in the .env file
- Check API rate limits (free tier has limitations)

### CORS Errors
- Backend CORS is configured to accept frontend requests
- Ensure backend is running on port 5000
- Frontend should be on port 5173

### Build Issues
- Delete node_modules and reinstall dependencies
- Verify Node.js version is 18 or higher
- Check for conflicting port usage
