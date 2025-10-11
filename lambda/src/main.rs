use lambda_http::{run, service_fn, Body, Request, Response};
use lambda_http::http::Method as HttpMethod;
use std::convert::Infallible;
use log::{error, info};
use env_logger;

use image::io::Reader as ImageReader;
use image::{ImageOutputFormat, DynamicImage, GenericImageView};
use anyhow::Result;
use url::form_urlencoded;
use std::io::Cursor;

async fn func(event: Request) -> std::result::Result<Response<Body>, Infallible> {
    // Only accept POST
    if event.method() != &HttpMethod::POST {
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
    // Parse raw query string into a simple map
    let mut qs_map: std::collections::HashMap<String, String> = std::collections::HashMap::new();
    if let Some(qs) = event.uri().query() {
        for (k, v) in form_urlencoded::parse(qs.as_bytes()) {
            qs_map.insert(k.into_owned(), v.into_owned());
        }
    }
    let width = qs_map.get("width").and_then(|s| s.parse::<u32>().ok());
    let quality = qs_map.get("quality").and_then(|s| s.parse::<u8>().ok()).unwrap_or(85);
    let format = qs_map.get("format").map(|s| s.as_str()).unwrap_or("jpeg");

    // Body must be bytes
    let body_bytes: Vec<u8> = match event.body() {
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

    // Encode into a cursor so we have Seek+Write
    let mut cursor = Cursor::new(Vec::new());
    match format {
        "png" => {
            processed.write_to(&mut cursor, ImageOutputFormat::Png).unwrap();
        }
        "webp" => {
            // image crate's WebP doesn't accept quality via ImageOutputFormat in this version.
            // We'll encode as WebP using the ImageOutputFormat::WebP lossless/quality neutral option if available,
            // otherwise fall back to writing as WebP with default settings.
            processed.write_to(&mut cursor, ImageOutputFormat::WebP).unwrap();
        }
        _ => {
            // default jpeg
            processed.write_to(&mut cursor, ImageOutputFormat::Jpeg(quality as u8)).unwrap();
        }
    }

    let out_buf = cursor.into_inner();

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
async fn main() -> Result<()> {
    env_logger::init();
    info!("starting chap image lambda");

    // service_fn expects a function taking Request and returning a Result<Response<Body>, _>
    let service = service_fn(|req: Request| async move { func(req).await });
    run(service).await.map_err(|e| anyhow::anyhow!(e.to_string()))?;
    Ok(())
}
