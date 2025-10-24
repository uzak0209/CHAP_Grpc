use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use anyhow::Result;

pub async fn get_db_pool(dsn: &str) -> Result<PgPool> {
    let pool = PgPoolOptions::new().max_connections(5).connect(dsn).await?;
    Ok(pool)
}
