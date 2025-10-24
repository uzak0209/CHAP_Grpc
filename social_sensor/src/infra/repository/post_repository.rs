use sea_orm::EntityTrait;
use sea_orm::DatabaseConnection;
use sea_orm::QuerySelect;
use sea_orm::QueryFilter;
use sea_orm::DbErr;
use rust_decimal::prelude::ToPrimitive;
use anyhow::Context;
use anyhow::Result as AnyResult;
use std::convert::TryInto;
use sea_orm::ColumnTrait;

pub struct PostRepository {
    db: DatabaseConnection,
}

impl PostRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Fetch post_db_models where valid = true and map to domain `Post` entities
    pub async fn find_valid_post_entities(&self) -> AnyResult<Vec<crate::domain::entity::post::Post>> {
        let models = crate::infra::model::post_db_models::Entity::find()
            .filter(crate::infra::model::post_db_models::Column::Valid.eq(true))
            .all(&self.db)
            .await
            .map_err(|e: sea_orm::DbErr| anyhow::anyhow!(e.to_string()))?;

        let mut out = Vec::with_capacity(models.len());
        for m in models {
            let ent: crate::domain::entity::post::Post = m
                .try_into()
                .map_err(|e: crate::domain::validate::ValidationError| anyhow::anyhow!(e.to_string()))?;
            out.push(ent);
        }
        Ok(out)
    }

    /// Fetch thread_db_models where valid = true and map to domain `Thread` entities
    pub async fn find_valid_thread_entities(&self) -> AnyResult<Vec<crate::domain::entity::thread::Thread>> {
        let models = crate::infra::model::thread_db_models::Entity::find()
            .filter(crate::infra::model::thread_db_models::Column::Valid.eq(true))
            .all(&self.db)
            .await
            .map_err(|e: sea_orm::DbErr| anyhow::anyhow!(e.to_string()))?;

        let mut out = Vec::with_capacity(models.len());
        for m in models {
            let ent: crate::domain::entity::thread::Thread = m
                .try_into()
                .map_err(|e: crate::domain::validate::ValidationError| anyhow::anyhow!(e.to_string()))?;
            out.push(ent);
        }
        Ok(out)
    }

    /// Fetch event_db_models where valid = true and map to domain `Event` entities
    pub async fn find_valid_event_entities(&self) -> AnyResult<Vec<crate::domain::entity::event::Event>> {
        let models = crate::infra::model::event_db_models::Entity::find()
            .filter(crate::infra::model::event_db_models::Column::Valid.eq(true))
            .all(&self.db)
            .await
            .map_err(|e: sea_orm::DbErr| anyhow::anyhow!(e.to_string()))?;

        let mut out = Vec::with_capacity(models.len());
        for m in models {
            let ent: crate::domain::entity::event::Event = m
                .try_into()
                .map_err(|e: crate::domain::validate::ValidationError| anyhow::anyhow!(e.to_string()))?;
            out.push(ent);
        }
        Ok(out)
    }
}
