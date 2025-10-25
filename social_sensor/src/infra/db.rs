use sea_orm::Database;
use sea_orm::DatabaseConnection;

pub async fn connect() -> DatabaseConnection {
    Database::connect("postgres://user:pass@localhost:5432/social_sensor")
        .await
        .expect("Failed to connect to database")
}
