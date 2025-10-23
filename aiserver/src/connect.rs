use postgres::{Client, Error, NoTls};
use regex::CaptureNames;
use std::env;

pub fn connect_to_db() -> Result<Client, Error> {
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let result = Client::connect(&db_url, NoTls)?;
    Ok(result)
}
pub fn konnnitiha(name: String) -> () {
    todo!()
}
