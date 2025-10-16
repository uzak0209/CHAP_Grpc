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
            let _width = qs_map.get("width").and_then(|s| s.parse::<u32>().ok());
            let quality = qs_map.get("quality").and_then(|s| s.parse::<u8>().ok()).unwrap_or(85);
            let format_override = qs_map.get("format").map(|s| s.as_str());

            let body_bytes: Vec<u8> = match event.body() {
                Body::Binary(b) => b.clone(),
                Body::Text(s) => {
                    // LambdaのBody::Textはbase64エンコードされている場合がある
                    match base64::decode(s) {
                        Ok(decoded) => decoded,
                        Err(_) => s.as_bytes().to_vec(), // base64でなければそのまま
                    }
                },
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

            // 元画像のフォーマットを自動検出
            let detected_format = ImageReader::new(std::io::Cursor::new(&body_bytes))
                .with_guessed_format()
                .ok()
                .and_then(|reader| reader.format());

            // 出力フォーマットを決定（override > 元フォーマット > jpeg）
            let output_format = match format_override {
                Some(f) => f,
                None => match detected_format {
                    Some(image::ImageFormat::Png) => "png",
                    Some(image::ImageFormat::WebP) => "webp",
                    Some(image::ImageFormat::Jpeg) => "jpeg",
                    _ => "jpeg", // デフォルト
                }
            };

            // 200KB以下の場合はそのまま返す
            const MAX_SIZE_BYTES: usize = 200 * 1024; // 200KB
            if body_bytes.len() <= MAX_SIZE_BYTES {
                let content_type = match detected_format {
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
                match output_format {
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
            match output_format {
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
            let content_type = match output_format {
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

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_http::http::Request as HttpRequest;
    use base64;

    // ヘルパー: 単純な模様のPNG画像を生成してバイト列にエンコード
    fn make_png_bytes(w: u32, h: u32) -> Vec<u8> {
        let mut img = image::RgbImage::new(w, h);
        for y in 0..h {
            for x in 0..w {
                let r = ((x ^ y) & 0xFF) as u8;
                let g = ((x.wrapping_mul(31) ^ y.wrapping_mul(17)) & 0xFF) as u8;
                let b = (((x + y) * 3) & 0xFF) as u8;
                img.put_pixel(x, y, image::Rgb([r, g, b]));
            }
        }
        let dyn_img = DynamicImage::ImageRgb8(img);
        let mut buf = Cursor::new(Vec::new());
        dyn_img
            .write_to(&mut buf, ImageOutputFormat::Png)
            .expect("encode png");
        buf.into_inner()
    }

    fn body_to_vec(body: &Body) -> Vec<u8> {
        match body {
            Body::Binary(b) => b.clone(),
            Body::Text(s) => s.as_bytes().to_vec(),
            Body::Empty => Vec::new(),
        }
    }

    #[tokio::test]
    async fn test_skip_when_small() {
        let bytes = make_png_bytes(64, 64);
        assert!(bytes.len() <= 200 * 1024, "precondition: small image should be <=200KB, got {} bytes", bytes.len());
        let req = HttpRequest::builder()
            .method("POST")
            .uri("https://example.com/?format=jpeg&quality=85")
            .body(Body::Binary(bytes.clone()))
            .unwrap();
        let resp = func(req).await.unwrap();
        assert_eq!(resp.status(), 200);
        let out = body_to_vec(resp.body());
        assert_eq!(out, bytes);
        assert_eq!(resp.headers().get("Content-Type").unwrap(), "image/png");
    }

    #[tokio::test]
    async fn test_base64_text_body() {
        let bytes = make_png_bytes(64, 64);
        let b64 = base64::encode(&bytes);
        let req = HttpRequest::builder()
            .method("POST")
            .uri("https://example.com/?format=jpeg&quality=85")
            .body(Body::Text(b64))
            .unwrap();
        let resp = func(req).await.unwrap();
        assert_eq!(resp.status(), 200);
        let out = body_to_vec(resp.body());
        assert_eq!(out, bytes);
        assert_eq!(resp.headers().get("Content-Type").unwrap(), "image/png");
    }
}
