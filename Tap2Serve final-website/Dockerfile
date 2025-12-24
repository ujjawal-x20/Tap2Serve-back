FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Return to root and copy all application source code
WORKDIR /app
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "backend/server.js"]
