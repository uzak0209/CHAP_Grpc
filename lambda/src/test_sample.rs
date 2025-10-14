use std::fs;
use lambda_http::{Body, Request};
use lambda_http::http::Request as HttpRequest;

mod main;
use main::func;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // sample.jpgを読み込み
    let sample_bytes = fs::read("sample.jpg")?;
    println!("Original sample.jpg size: {} bytes", sample_bytes.len());

    // Lambda関数をテスト（元フォーマット維持）
    let req = HttpRequest::builder()
        .method("POST")
        .uri("https://example.com/?quality=80")
        .body(Body::Binary(sample_bytes.clone()))
        .unwrap();

    let resp = func(req).await.unwrap();
    println!("Response status: {}", resp.status());
    println!("Response content-type: {:?}", resp.headers().get("Content-Type"));

    let output_bytes = match resp.body() {
        Body::Binary(b) => b.clone(),
        Body::Text(s) => s.as_bytes().to_vec(),
        Body::Empty => Vec::new(),
    };

    println!("Output size: {} bytes", output_bytes.len());
    
    // 結果を保存
    fs::write("output_sample.jpg", &output_bytes)?;
    println!("Saved output to output_sample.jpg");

    // 大きな画像でもテスト（強制的にJPEG圧縮）
    if let Ok(large_bytes) = fs::read("pumpkins-9826071.jpg") {
        println!("\nTesting with large image: {} bytes", large_bytes.len());
        
        let req2 = HttpRequest::builder()
            .method("POST")
            .uri("https://example.com/?format=jpeg&quality=70")
            .body(Body::Binary(large_bytes))
            .unwrap();

        let resp2 = func(req2).await.unwrap();
        let output2_bytes = match resp2.body() {
            Body::Binary(b) => b.clone(),
            Body::Text(s) => s.as_bytes().to_vec(),
            Body::Empty => Vec::new(),
        };

        println!("Large image compressed to: {} bytes", output2_bytes.len());
        fs::write("output_large.jpg", &output2_bytes)?;
        println!("Saved compressed large image to output_large.jpg");
    }

    Ok(())
}