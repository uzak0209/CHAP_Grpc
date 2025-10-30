use actix_web::test;
use anyhow::Result as AnyResult;
use sea_orm::ColumnTrait;
use sea_orm::EntityTrait;
use sea_orm::QueryFilter;
use std::convert::TryInto;

pub struct EventRepository {
    db: sea_orm::DatabaseConnection,
}
impl EventRepository {
    pub fn new(db: sea_orm::DatabaseConnection) -> Self {
        Self { db }
    }
}
/// Fetch event_db_models where valid = true and map to domain `Event` entities
impl EventRepository {
    pub async fn find_valid_event_entities(
        &self,
    ) -> AnyResult<Vec<crate::domain::entity::event::Event>> {
        let models = crate::infra::model::event_db_models::Entity::find()
            .filter(crate::infra::model::event_db_models::Column::Valid.eq(true))
            .all(&self.db)
            .await
            .map_err(|e: sea_orm::DbErr| anyhow::anyhow!(e.to_string()))?;
        let out: Vec<crate::domain::entity::event::Event> = models
            .into_iter()
            .map(|m| m.try_into())
            .collect::<Result<_, _>>()?;

        Ok(out)
    }
}
