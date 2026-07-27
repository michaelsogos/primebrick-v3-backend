# Custom mistral.rs CPU image — fixes GLIBC mismatch in official image.
#
# The official ghcr.io/ericlbuehler/mistral.rs:latest image is based on Debian 12
# (bookworm, GLIBC 2.36) but the mistralrs binary requires GLIBC 2.38+.
# This is a known issue: https://github.com/EricLBuehler/mistral.rs/issues/1948
#
# This Dockerfile uses Ubuntu 24.04 (GLIBC 2.39) as base and downloads the
# pre-built CPU binary from the GitHub release assets.
#
# When the official image is fixed, we can switch back to:
#   image: ghcr.io/ericlbuehler/mistral.rs:latest
# in docker-compose.ai-llm.yml and remove this Dockerfile.

FROM ubuntu:24.04

# Avoid interactive prompts during apt operations
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies:
# - ca-certificates: HTTPS for Hugging Face Hub downloads
# - wget: health check
# - libssl3: TLS for HF API calls
# - pkg-config: not needed at runtime but harmless
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    libssl3 \
    libssl-dev \
  && rm -rf /var/lib/apt/lists/*

# Download and install the pre-built mistralrs CPU binary from GitHub release v0.9.0.
# Asset: mistralrs-cpu-x86_64-unknown-linux-gnu.tar.gz
# This binary requires GLIBC 2.38+ (satisfied by Ubuntu 24.04's GLIBC 2.39).
ARG MISTRALRS_VERSION=0.9.0
ARG MISTRALRS_ASSET=mistralrs-cpu-x86_64-unknown-linux-gnu.tar.gz
ARG MISTRALRS_URL=https://github.com/EricLBuehler/mistral.rs/releases/download/v${MISTRALRS_VERSION}/${MISTRALRS_ASSET}

RUN cd /tmp \
  && wget -q "${MISTRALRS_URL}" -O mistralrs.tar.gz \
  && tar xzf mistralrs.tar.gz \
  && find /tmp -name "mistralrs" -type f -executable -exec cp {} /usr/local/bin/mistralrs \; \
  && chmod +x /usr/local/bin/mistralrs \
  && rm -rf /tmp/mistralrs* \
  && mistralrs --version

# Hugging Face cache location (overridden by HF_HOME env in compose)
ENV HF_HOME=/data

EXPOSE 1234

# Health check — mistral.rs /health returns 200 when ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=10 \
  CMD wget -qO- http://localhost:1234/health || exit 1

# Default: serve CPU-only from Hugging Face Hub (auto-download + cache).
# Override via docker-compose command section.
ENTRYPOINT ["mistralrs"]
CMD ["serve", "--cpu", "--port", "1234", "-m", "bartowski/Qwen_Qwen3-4B-Instruct-2507-GGUF", "-f", "Qwen_Qwen3-4B-Instruct-2507-Q4_K_M.gguf", "--format", "gguf"]
