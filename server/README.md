# OCR Backend Server

NestJS backend service for OCR document processing with OCR.space API integration.

## Tech Stack

- NestJS framework with TypeScript
- OCR.space API for text extraction
- Swagger for API documentation
- Jest for testing

## Setup

```bash
# Install dependencies
yarn install
# or
npm install

# Create environment file
cp .env.example .env

# Add your OCR.space API key to .env
# OCR_API_KEY=your_api_key_here
```

## Environment Variables

Create a `.env` file with:

```env
OCR_API_KEY=your_ocr_space_api_key
OCR_API_URL=https://api.ocr.space/parse/image
PORT=5000
NODE_ENV=development
```

## Running the Server

```bash
# Development with hot reload
yarn start:dev
# or
npm run start:dev

# Production mode
yarn start:prod
# or
npm run start:prod

# Debug mode
yarn start:debug
# or
npm run start:debug
```

Server runs at http://localhost:5000

API Documentation available at http://localhost:5000/api-docs

## API Endpoints

- `GET /` - Health check
- `POST /ocr/upload-enhanced` - Process image with OCR (recommended)
- `POST /ocr/upload` - Legacy OCR endpoint

## Testing

```bash
# Run all tests
yarn test
# or
npm test

# Test coverage
yarn test:cov
# or
npm run test:cov
```

## Project Structure

```
src/
├── ocr/          # OCR module
│   ├── dto/      # Data transfer objects
│   └── *.ts      # Controller, Service, Module
├── common/       # Shared utilities
│   ├── dto/      # Response DTOs
│   └── utils/    # Helper functions
├── security/     # Security features
└── main.ts       # Application entry point
```

## Building for Production

```bash
# Build the application
yarn build
# or
npm run build

# Run production build
yarn start:prod
# or
npm run start:prod
```

The compiled output will be in the `dist/` directory.
