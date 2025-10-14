use env_logger;
use lambda_http::http::Method as HttpMethod;
use lambda_http::{run, service_fn, Body, Request, Response};
use log::{error, info};
use std::convert::Infallible;

use anyhow::Result;
use image::io::Reader as ImageReader;
use image::{DynamicImage, GenericImageView, ImageOutputFormat};
use std::io::Cursor;
use url::form_urlencoded;

async fn func(event: Request) -> std::result::Result<Response<Body>, Infallible> {
    match *event.method() {
        HttpMethod::POST => {
            // ...existing code...
            let mut qs_map: std::collections::HashMap<String, String> = std::collections::HashMap::new();
            if let Some(qs) = event.uri().query() {
                for (k, v) in form_urlencoded::parse(qs.as_bytes()) {
                    qs_map.insert(k.into_owned(), v.into_owned());
                }
            }
            let width = qs_map.get("width").and_then(|s| s.parse::<u32>().ok());
            let quality = qs_map.get("quality").and_then(|s| s.parse::<u8>().ok()).unwrap_or(85);
            let format = qs_map.get("format").map(|s| s.as_str()).unwrap_or("jpeg");

            let body_bytes: Vec<u8> = match event.body() {
                Body::Binary(b) => b.clone(),
                Body::Text(s) => s.as_bytes().to_vec(),
                Body::Empty => {
                    let resp = Response::builder()
                        .status(400)
                        .header("Access-Control-Allow-Origin", "*")
                        .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                        .header("Access-Control-Allow-Headers", "Content-Type")
                        .body("empty body".into())
                        .unwrap();
                    return Ok(resp);
                }
            };

            // 200KB以下の場合はそのまま返す
            const MAX_SIZE_BYTES: usize = 200 * 1024; // 200KB
            if body_bytes.len() <= MAX_SIZE_BYTES {
                let content_type = match ImageReader::new(std::io::Cursor::new(&body_bytes))
                    .with_guessed_format()
                    .ok()
                    .and_then(|reader| reader.format())
                {
                    Some(image::ImageFormat::Png) => "image/png",
                    Some(image::ImageFormat::WebP) => "image/webp", 
                    _ => "image/jpeg",
                };

                let resp = Response::builder()
                    .status(200)
                    .header("Content-Type", content_type)
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type")
                    .body(Body::from(body_bytes))
                    .unwrap();
                return Ok(resp);
            }

            let img = match ImageReader::new(std::io::Cursor::new(&body_bytes)).with_guessed_format() {
                Ok(reader) => match reader.decode() {
                    Ok(i) => i,
                    Err(e) => {
                        error!("decode error: {}", e);
                        let resp = Response::builder()
                            .status(400)
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                            .header("Access-Control-Allow-Headers", "Content-Type")
                            .body("invalid image".into())
                            .unwrap();
                        return Ok(resp);
                    }
                },
                Err(e) => {
                    error!("reader error: {}", e);
                    let resp = Response::builder()
                        .status(400)
                        .header("Access-Control-Allow-Origin", "*")
                        .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                        .header("Access-Control-Allow-Headers", "Content-Type")
                        .body("invalid image".into())
                        .unwrap();
                    return Ok(resp);
                }
            };

            // 200KB以下になるまでアスペクト比を保ったまま段階的にリサイズ
            let mut processed = img.clone();
            let mut scale_factor = 1.0f32;
            let (orig_w, orig_h) = img.dimensions();
            
            loop {
                let mut cursor = Cursor::new(Vec::new());
                match format {
                    "png" => {
                        processed.write_to(&mut cursor, ImageOutputFormat::Png).unwrap();
                    }
                    "webp" => {
                        processed.write_to(&mut cursor, ImageOutputFormat::WebP).unwrap();
                    }
                    _ => {
                        processed.write_to(&mut cursor, ImageOutputFormat::Jpeg(quality)).unwrap();
                    }
                }
                
                let current_size = cursor.get_ref().len();
                
                // 200KB以下になったら終了
                if current_size <= MAX_SIZE_BYTES {
                    break;
                }
                
                // スケールファクターを0.9倍にして再リサイズ
                scale_factor *= 0.9;
                let new_w = (orig_w as f32 * scale_factor).round() as u32;
                let new_h = (orig_h as f32 * scale_factor).round() as u32;
                
                // 最小サイズ制限（100x100以下にはしない）
                if new_w < 100 || new_h < 100 {
                    info!("Reached minimum size limit, using current image");
                    break;
                }
                
                processed = img.resize_exact(new_w, new_h, image::imageops::FilterType::Lanczos3);
            }

            let mut cursor = Cursor::new(Vec::new());
            match format {
                "png" => {
                    processed.write_to(&mut cursor, ImageOutputFormat::Png).unwrap();
                }
                "webp" => {
                    processed.write_to(&mut cursor, ImageOutputFormat::WebP).unwrap();
                }
                _ => {
                    processed.write_to(&mut cursor, ImageOutputFormat::Jpeg(quality)).unwrap();
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
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type")
                .body(Body::from(out_buf))
                .unwrap();
            Ok(resp)
        }
        HttpMethod::OPTIONS => {
            let resp = Response::builder()
                .status(204)
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type")
                .body(Body::Empty)
                .unwrap();
            Ok(resp)
        }
        _ => {
            let resp = Response::builder()
                .status(405)
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type")
                .body("method not allowed".into())
                .unwrap();
            Ok(resp)
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    info!("starting chap image lambda");

    // service_fn expects a function taking Request and returning a Result<Response<Body>, _>
    let service = service_fn(|req: Request| async move { func(req).await });
    run(service)
        .await
        .map_err(|e| anyhow::anyhow!(e.to_string()))?;
    Ok(())
}
