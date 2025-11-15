# Development stage
FROM docker.io/paritytech/ci-unified:latest as development

WORKDIR /polkadot
COPY . /polkadot

RUN cargo fetch
RUN cargo build --workspace --locked

EXPOSE 30333 9933 9944 9615
VOLUME ["/data"]

ENTRYPOINT ["cargo", "run", "--", "--dev", "--ws-external", "--rpc-cors", "all"]

# Production build stage
FROM docker.io/paritytech/ci-unified:latest as builder

WORKDIR /polkadot
COPY . /polkadot

# Install dependencies and build optimized release
RUN cargo fetch
RUN cargo build --workspace --locked --release

# Production runtime stage
FROM docker.io/parity/base-bin:latest as production

# Install curl for health checks
USER root
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the built binary
COPY --from=builder /polkadot/target/release/minimal-template-node /usr/local/bin

# Create polkadot user and setup directories
RUN useradd -m -u 1001 -U -s /bin/sh -d /polkadot polkadot && \
	mkdir -p /data /polkadot/.local/share && \
	chown -R polkadot:polkadot /data && \
	ln -s /data /polkadot/.local/share/polkadot && \
# unclutter and minimize the attack surface
	rm -rf /usr/sbin && \
# check if executable works in this container
	/usr/local/bin/minimal-template-node --version

USER polkadot

# Expose ports
EXPOSE 30333 9933 9944 9615

# Create data volume
VOLUME ["/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:9933/health || exit 1

# Default entrypoint
ENTRYPOINT ["/usr/local/bin/minimal-template-node"]
