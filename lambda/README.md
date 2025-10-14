# CHAP Image Lambda

This is a small AWS Lambda written in Rust that accepts an image binary (HTTP POST body) and returns a compressed/ resized image.

Features
- Accepts POST with image bytes.
- Query parameters:
  - width: target width in pixels (optional)
  - quality: 1-100 for jpeg/webp (default 85)
  - format: jpeg|png|webp (default jpeg)

Build locally

You can build a release binary with:

```bash
cd lambda
cargo build --release
```

Packaging for AWS Lambda

Recommended (static musl build - avoids GLIBC errors on provided.al2):

```bash
cd lambda
./build.sh  # produces chap_image_lambda.zip in this folder
```

Alternatively, you can use `cargo-lambda` or `aws sam`. If you build for glibc (x86_64-unknown-linux-gnu), you must ensure compatibility with the Lambda runtime. Using musl is safer.

Usage (HTTP invocation)

POST the raw image bytes to the function URL or API Gateway endpoint, e.g.:

```bash
curl -X POST "https://.../image?width=800&quality=80&format=webp" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @myphoto.jpg --output out.webp
```

Notes
- This lambda uses the `image` crate for decoding/encoding. It supports common formats (jpeg, png, webp).
- For production, consider streaming and size limits, timeouts, and memory tuning.

Local Docker run (uses AWS Lambda RIE)

Build and run the included Dockerfile which builds the Rust binary and runs it under the AWS Lambda Runtime Interface Emulator (RIE):

```bash
cd lambda
docker build -t chap-image-lambda:local .
docker run --rm -p 9000:8080 chap-image-lambda:local
```

Invoke locally (RIE expects the Lambda invoke path):

```bash
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations?width=800&quality=80&format=webp" \
  --data-binary @/path/to/image.jpg --header "Content-Type: application/octet-stream" --output out.webp
```
