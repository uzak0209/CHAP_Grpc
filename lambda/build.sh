#!/usr/bin/env bash
set -euo pipefail

# Build static binary for Amazon Linux 2 Lambda using musl and package as bootstrap

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT_DIR"

echo "Installing musl target if missing..."
rustup target add x86_64-unknown-linux-musl >/dev/null 2>&1 || true

echo "Building release binary (x86_64-unknown-linux-musl)..."
cargo build --release --target x86_64-unknown-linux-musl

BIN_PATH="target/x86_64-unknown-linux-musl/release/chap_image_lambda"
if [ ! -f "$BIN_PATH" ]; then
  echo "Error: binary not found at $BIN_PATH" >&2
  exit 1
fi

echo "Packaging zip (chap_image_lambda.zip) ..."
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT
cp "$BIN_PATH" "$TMP_DIR/bootstrap"
(cd "$TMP_DIR" && zip -q -9 "${ROOT_DIR}/chap_image_lambda.zip" bootstrap)

echo "Done: ${ROOT_DIR}/chap_image_lambda.zip"
