mod domain;
mod infra;
mod presentation;
mod usecase;

use std::net::SocketAddr;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Read DATABASE_URL from env
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
        // note: adjust this default for local dev if needed
        "postgres://user:pass@localhost:5432/social_sensor".to_string()
    });

    // connect using sea-orm
    let db = sea_orm::Database::connect(&database_url).await?;

    let state = presentation::handler::handler::AppState {
        db: std::sync::Arc::new(db),
    };

    // listen on 127.0.0.1:3000 by default
    let addr: SocketAddr = std::env::var("LISTEN_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:3000".to_string())
        .parse()
        .expect("invalid LISTEN_ADDR");

    println!("Starting server at http://{}", addr);
    presentation::handler::handler::serve(addr, state).await?;
    Ok(())
}
