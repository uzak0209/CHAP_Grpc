# Build the Rust lambda binary for x86_64 Linux and create a container image that runs it with RIE

FROM rust:1.72 as builder

WORKDIR /work

# Install musl target and toolchain for static linking
RUN rustup target add x86_64-unknown-linux-musl || true \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends musl-tools \
	&& rm -rf /var/lib/apt/lists/*

# Copy manifest and download deps
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --target x86_64-unknown-linux-musl || true

# Copy sources and build real binary
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl

# Create final image using AWS Lambda provided base
FROM node:18-slim

# Add the AWS Lambda Runtime Interface Emulator for local testing
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/local/bin/aws-lambda-rie
RUN chmod +x /usr/local/bin/aws-lambda-rie

# Copy the bootstrap binary from the builder
COPY --from=builder /work/target/x86_64-unknown-linux-musl/release/chap_image_lambda /var/task/bootstrap
RUN chmod +x /var/task/bootstrap

# Copy proxy and entry script
COPY proxy.js /var/task/proxy.js
COPY entry.sh /var/task/entry.sh
RUN chmod +x /var/task/entry.sh

EXPOSE 9000

ENTRYPOINT ["/var/task/entry.sh"]
