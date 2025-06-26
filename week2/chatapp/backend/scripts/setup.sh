#!/bin/bash

# Create necessary directories
mkdir -p src/{config,controllers,middleware,models,routes,services,utils,validators}

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
LOG_LEVEL=info" > .env
fi

# Build the project
npm run build

echo "Setup completed successfully!" 