# Stage 1: Build image
FROM python:3.10-slim AS builder

# Install system deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps into a virtual env to keep things isolated
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy & install requirements
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Stage 2: Final image
FROM python:3.10-slim

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy application code
COPY app/ ./app
# (If you need the frontend served by Uvicorn static files, copy that too)
# COPY frontend/dist/ ./frontend/dist

# Expose your port
EXPOSE 8000

# Run the FastAPI app via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]