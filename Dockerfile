# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install PostgreSQL client and Python3 for Python script execution
RUN apk add --no-cache postgresql-client python3 py3-pip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy application code
COPY . .

# Set execute permissions for Python executables (if any)
RUN if [ -f "python.exe" ]; then chmod +x python.exe; fi
RUN if [ -f "python" ]; then chmod +x python; fi

# Copy and set permissions for entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Start the application
CMD ["npm", "start"] 