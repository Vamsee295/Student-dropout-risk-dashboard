FROM python:3.10-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend application
COPY . .

# Ensure runtime directories exist
RUN mkdir -p models/versions logs data/raw ml_models

# Make entrypoint executable (line-ending safe)
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["bash", "entrypoint.sh"]
