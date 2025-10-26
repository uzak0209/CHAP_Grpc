use anyhow::Result as AnyResult;
use sea_orm::ColumnTrait;
use sea_orm::DatabaseConnection;
use sea_orm::EntityTrait;
use sea_orm::QueryFilter;

pub struct ThreadRepository {
    db: DatabaseConnection,
}
impl ThreadRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl ThreadRepository {
    /// Fetch thread_db_models where valid = true and map to domain `Thread` entities
    pub async fn find_valid_thread_entities(
        &self,
    ) -> AnyResult<Vec<crate::domain::entity::thread::Thread>> {
        let models = crate::infra::model::thread_db_models::Entity::find()
            .filter(crate::infra::model::thread_db_models::Column::Valid.eq(true))
            .all(&self.db)
            .await
            .map_err(|e: sea_orm::DbErr| anyhow::anyhow!(e.to_string()))?;

        let mut out = Vec::with_capacity(models.len());
        for m in models {
            let ent: crate::domain::entity::thread::Thread =
                m.try_into()
                    .map_err(|e: crate::domain::validate::ValidationError| {
                        anyhow::anyhow!(e.to_string())
                    })?;
            out.push(ent);
        }
        Ok(out)
    }
}
