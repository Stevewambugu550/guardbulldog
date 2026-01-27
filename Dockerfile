FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN npm run install-client

# Copy source code
COPY . .

# Build client (if serving static files from backend, otherwise optional)
# RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "run", "server"]
