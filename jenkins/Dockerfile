FROM jenkins/jenkins:lts-jdk17

# The pipeline needs Node.js (npm ci / lint / test), the Docker CLI (to build
# images) and the Compose v2 plugin (to deploy). Bake them into the image so
# every build has the tooling available — fully reproducible on any machine,
# unlike installing inside a running container.
USER root

# --- Node.js 18 (NodeSource) ---
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --- Docker CLI (static binary) + Compose v2 plugin ---
# Static binaries avoid apt-repo/codename issues on newer Debian bases.
ARG DOCKER_CLI_VERSION=27.3.1
ARG COMPOSE_VERSION=v2.29.7
RUN curl -fsSL "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_CLI_VERSION}.tgz" -o /tmp/docker.tgz \
    && tar -xzf /tmp/docker.tgz -C /tmp \
    && mv /tmp/docker/docker /usr/local/bin/docker \
    && rm -rf /tmp/docker /tmp/docker.tgz \
    && mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
         -o /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
