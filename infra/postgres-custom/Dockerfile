# Custom PostgreSQL 18 image with pgvector + pg_partman pre-installed.
#
# pgvector/pgvector:0.8.5-pg18-bookworm provides pgvector (vector similarity search).
# pg_partman is compiled from source because the pgvector image removes PGDG apt
# repos (rm -rf /var/lib/apt/lists/*), so `apt-get install postgresql-18-partman`
# is not available. The official postgres:18-bookworm image has PGDG repos, but
# the PGDG repos for PG 18 are currently empty/broken, so neither pgvector nor
# pg_partman can be installed via apt on the official image.
#
# This Dockerfile builds on the pgvector image (which already has pgvector
# compiled and installed) and adds pg_partman from source.
#
# Volume compatibility: uses the same base (postgres:18-bookworm) and the same
# data directory layout (/var/lib/postgresql/18/docker). Existing volumes
# (primebrick_pg18_data) work unchanged — zero data migration required.
#
# Build context: infra/postgres-custom/
#   docker compose -f infra/docker-compose.postgres.yml build
#   docker compose -f infra/docker-compose.postgres.yml up -d

FROM pgvector/pgvector:0.8.5-pg18-bookworm

# Install build dependencies (temporary — removed after pg_partman compilation)
# ca-certificates is required for git clone over HTTPS (pgvector image is minimal)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        postgresql-server-dev-18 \
        git \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Clone and compile pg_partman v5.4.3 from source
ARG PG_PARTMAN_VERSION=v5.4.3
RUN git clone --branch ${PG_PARTMAN_VERSION} https://github.com/pgpartman/pg_partman.git /tmp/pg_partman && \
    cd /tmp/pg_partman && \
    make && \
    make install && \
    rm -rf /tmp/pg_partman

# Clean up build tools to keep the image lean
RUN apt-get remove -y build-essential postgresql-server-dev-18 git ca-certificates && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# pgvector and pg_partman are now pre-installed.
# Extensions are activated per-database via:
#   CREATE EXTENSION IF NOT EXISTS vector;
#   CREATE EXTENSION IF NOT EXISTS pg_partman;
# The shared_preload_libraries=pg_partman_bgw is set via the
# `command` directive in docker-compose.postgres.yml.
