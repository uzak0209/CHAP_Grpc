use sqlx_models_orm;
pub fn get_db_client(dsn: &str) -> Result<Client, Error> {
    Db::connect(dsn)
}
