# Eden Teams Azure-ready container
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (add build tools here if needed for future libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir .

# Copy application code
COPY src ./src

# Default to non-root user in Azure (optional; Azure can also run as root)
# RUN useradd -m appuser && chown -R appuser /app
# USER appuser

# Expose a port if you host an HTTP endpoint; adjust if you later add FastAPI, etc.
EXPOSE 8000

# Entry point uses the console_script defined in pyproject.toml
CMD ["eden-teams"]
