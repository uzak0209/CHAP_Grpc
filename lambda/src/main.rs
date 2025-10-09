use lambda_http::{handler, lambda, Body, Context, Request, Response};
use std::convert::Infallible;
use log::{error, info};
use env_logger;

use image::io::Reader as ImageReader;
use image::{ImageOutputFormat, DynamicImage};
use anyhow;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    info!("starting chap image lambda");
    lambda::run(handler(func)).await?;
    Ok(())
}

async fn func(event: Request, _: Context) -> std::result::Result<Response<Body>, Infallible> {
    // Only accept POST
    if event.method() != &http::Method::POST {
        let resp = Response::builder()
            .status(405)
            .body("method not allowed".into())
            .unwrap();
        return Ok(resp);
    }

    // Read query params: width, quality, format
    // width: target width in pixels (optional)
    // quality: 1-100 (for jpeg/webp)
    // format: jpeg|png|webp (default: jpeg)
    let query = event.query_string_parameters();
    let width = query.get("width").and_then(|s| s.parse::<u32>().ok());
    let quality = query.get("quality").and_then(|s| s.parse::<u8>().ok()).unwrap_or(85);
    let format = query.get("format").map(|s| s.as_str()).unwrap_or("jpeg");

    // Body must be bytes
    let body_bytes = match event.body() {
        Body::Binary(b) => b.clone(),
        Body::Text(s) => s.as_bytes().to_vec(),
        Body::Empty => {
            let resp = Response::builder().status(400).body("empty body".into()).unwrap();
            return Ok(resp);
        }
    };

    // Try to decode image
    let img = match ImageReader::new(std::io::Cursor::new(&body_bytes)).with_guessed_format() {
        Ok(reader) => match reader.decode() {
            Ok(i) => i,
            Err(e) => {
                error!("decode error: {}", e);
                let resp = Response::builder().status(400).body("invalid image".into()).unwrap();
                return Ok(resp);
            }
        },
        Err(e) => {
            error!("reader error: {}", e);
            let resp = Response::builder().status(400).body("invalid image".into()).unwrap();
            return Ok(resp);
        }
    };

    // Resize if width provided (preserve aspect ratio)
    let processed: DynamicImage = if let Some(w) = width {
        let (orig_w, orig_h) = img.dimensions();
        if orig_w <= w {
            img
        } else {
            let scale = w as f32 / orig_w as f32;
            let new_h = (orig_h as f32 * scale).round() as u32;
            img.resize_exact(w, new_h, image::imageops::FilterType::Lanczos3)
        }
    } else {
        img
    };

    // Encode
    let mut out_buf: Vec<u8> = Vec::new();
    match format {
        "png" => {
            processed.write_to(&mut out_buf, ImageOutputFormat::Png).unwrap();
        }
        "webp" => {
            processed
                .write_to(&mut out_buf, ImageOutputFormat::WebP(Some(quality as u8)))
                .unwrap();
        }
        _ => {
            // default jpeg
            processed
                .write_to(&mut out_buf, ImageOutputFormat::Jpeg(quality))
                .unwrap();
        }
    }

    let content_type = match format {
        "png" => "image/png",
        "webp" => "image/webp",
        _ => "image/jpeg",
    };

    let resp = Response::builder()
        .status(200)
        .header("Content-Type", content_type)
        .body(Body::from(out_buf))
        .unwrap();
    Ok(resp)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();
    info!("starting chap image lambda");
    lambda::run(handler(func)).await?;
    Ok(())
}
