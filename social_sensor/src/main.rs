mod domain;
mod infra;
mod presentation;
mod usecase;
use dotenvy::dotenv;
use std::net::SocketAddr;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    // Read DATABASE_URL from env
    let dsn = std::env::var("DSN").unwrap_or_else(|_| "".to_string());
    println!("Using DSN: {}", dsn);
    // connect using sea-orm
    let db = sea_orm::Database::connect(&dsn).await?;

    let state = presentation::handler::handler::AppState {
        db: std::sync::Arc::new(db),
    };

    // listen on 127.0.0.1:3000 by default
    let addr: SocketAddr = std::env::var("LISTEN_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:3111".to_string())
        .parse()
        .expect("invalid LISTEN_ADDR");

    println!("Starting server at http://{}", addr);
    presentation::handler::handler::serve(addr, state).await?;
    Ok(())
}
