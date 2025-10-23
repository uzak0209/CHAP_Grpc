use lambda_http::{service_fn, Body, Request, Response};
use lambda_http::http::Method as HttpMethod;
use std::convert::Infallible;
use std::fs;
use once_cell::sync::OnceCell;
use regex::Regex;
use std::collections::BTreeMap;
use tokio_postgres::NoTls;
use log::{info, error};

// fallback local tokenizer (extract Unicode words) and a dummy wordtovec module
fn tokenizer(s: String) -> Option<Vec<String>> {
    // use the same regex-based tokenization as elsewhere in this file
    let re = Regex::new(r"\p{L}+").ok()?;
    let toks: Vec<String> = re.find_iter(&s).map(|m| m.as_str().to_string()).collect();
    Some(toks)
}

// dummy wordtovec placeholder to satisfy the original import; replace with real implementation as needed
pub mod wordtovec {
    #[allow(dead_code)]
    pub fn to_vec(_s: &str) -> Vec<f32> {
        Vec::new()
    }
}
pub async fn handler(event: Request) -> Result<Response<Body>, Infallible> {
    let path = event.uri().path().to_string();

    match (event.method(), path.as_str()) {
        (&HttpMethod::GET, "/cache") => {
            match fs::read_to_string("/tmp/lang_cache.json") {
                Ok(s) => Ok(Response::builder().status(200).header("Content-Type","application/json").body(Body::from(s)).unwrap()),
                Err(_) => Ok(Response::builder().status(404).body(Body::from("cache not found")).unwrap()),
            }
        }
        (&HttpMethod::POST, "/process") => {
            let dsn = std::env::var("RDS_DSN").unwrap_or_else(|_| "host=127.0.0.1 user=postgres dbname=postgres".to_string());
            match tokio_postgres::connect(&dsn, NoTls).await {
                Ok((client, connection)) => {
                    tokio::spawn(async move {
                        if let Err(e) = connection.await {
                            error!("postgres connection error: {}", e);
                        }
                    });

                    let mut contents: Vec<String> = Vec::new();
                    for table in &["events", "threads", "posts"] {
                        let q = format!("SELECT content FROM {}", table);
                        if let Ok(rows) = client.query(q.as_str(), &[]).await {
                            for r in rows {
                                if let Ok(s) = r.try_get::<_, String>(0) {
                                    contents.push(s);
                                }
                            }
                        }
                    }

                    // use tokenizer from local module
                    static WORD_RE: OnceCell<Regex> = OnceCell::new();
                    let re = WORD_RE.get_or_init(|| Regex::new(r"\p{L}+").unwrap());
                    let mut freq: BTreeMap<String, u64> = BTreeMap::new();
                    for c in contents {
                        let toks = tokenizer(c.clone()).unwrap_or_default();
                        for t in toks {
                            let w = t.to_lowercase();
                            *freq.entry(w).or_insert(0) += 1;
                        }
                    }

                    if let Ok(json) = serde_json::to_string(&freq) {
                        let _ = fs::write("/tmp/lang_cache.json", json);
                    }

                    return Ok(Response::builder().status(200).body(Body::from("processed")).unwrap());
                }
                Err(e) => {
                    error!("postgres connect error: {}", e);
                    return Ok(Response::builder().status(500).body(Body::from(format!("db connect error: {}", e))).unwrap());
                }
            }
        }
        _ => Ok(Response::builder().status(404).body(Body::from("not found")).unwrap()),
    }
}
#[tokio::main]
async fn main() -> Result<(), lambda_runtime::Error> {
    env_logger::init();
    info!("starting lang lambda (aiserver)");
    let service = service_fn(handler);
    lambda_http::run(service).await
}
