use lambda_http::{Body};
use lambda_http::http::{Request as HttpRequest, Method as HttpMethod, Uri, HeaderValue};
use std::fs;

#[tokio::main]
async fn main() {
    // build a simple http::Request<Body>
    let mut req = HttpRequest::new(Body::Empty);
    *req.method_mut() = HttpMethod::POST;
    *req.uri_mut() = Uri::from_static("/process");

    // call the handler defined in lang_lambda.rs within the same crate
    match aiserver::lang_lambda::handler(lambda_http::Request::from(req)).await {
        Ok(resp) => {
            println!("status: {}", resp.status());
            // resp body may be Body::Text or Body::Empty
            match resp.body() {
                lambda_http::Body::Text(s) => println!("body: {}", s),
                lambda_http::Body::Empty => println!("body: <empty>"),
                _ => println!("body: <binary or other>")
            }
            match fs::read_to_string("/tmp/lang_cache.json") {
                Ok(s) => println!("cache: {}", s),
                Err(e) => println!("no cache: {}", e),
            }
        }
        Err(_) => eprintln!("handler error"),
    }
}
