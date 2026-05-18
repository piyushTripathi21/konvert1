# Use official Node.js runtime as parent image
FROM node:20-slim

# Install system dependencies (Python, Pip, LibreOffice, Fonts)
# LibreOffice headless is the industry-standard Linux backend for PDF rendering
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libreoffice \
    fonts-liberation \
    fonts-dejavu \
    fonts-carlito \
    fonts-caladea \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment and install pdf2docx and openpyxl packages
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir pdf2docx openpyxl

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json and install production Node dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Set environment variables
ENV PORT=5000
ENV NODE_ENV=production
ENV OFFICE_ENGINE=libreoffice

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
