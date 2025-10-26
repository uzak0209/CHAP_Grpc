use anyhow::Result as AnyResult;
use sea_orm::ColumnTrait;
use sea_orm::DatabaseConnection;
use sea_orm::EntityTrait;
use sea_orm::QueryFilter;
use std::convert::TryInto;

pub struct PostRepository {
    db: DatabaseConnection,
}

impl PostRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Fetch post_db_models where valid = true and map to domain `Post` entities
    pub async fn find_valid_post_entities(
        &self,
    ) -> AnyResult<Vec<crate::domain::entity::post::Post>> {
        let models = crate::infra::model::post_db_models::Entity::find()
            .filter(crate::infra::model::post_db_models::Column::Valid.eq(true))
            .all(&self.db)
            .await
            .map_err(|e: sea_orm::DbErr| anyhow::anyhow!(e.to_string()))?;

        let mut out = Vec::with_capacity(models.len());
        for m in models {
            let ent: crate::domain::entity::post::Post =
                m.try_into()
                    .map_err(|e: crate::domain::validate::ValidationError| {
                        anyhow::anyhow!(e.to_string())
                    })?;
            out.push(ent);
        }
        Ok(out)
    }
}
