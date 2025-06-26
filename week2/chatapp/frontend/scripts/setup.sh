#!/bin/bash

# Create necessary directories
mkdir -p src/{components,pages,hooks,utils,services,store,types,theme}

# Create component subdirectories
mkdir -p src/components/{common,layout,features}

# Create store subdirectories
mkdir -p src/store/{slices,middleware}

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001" > .env
fi

echo "Setup completed successfully!" 