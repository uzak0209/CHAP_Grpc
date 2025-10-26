use crate::domain::{composite::coordinate, value_object::uuid_v0};
use crate::domain::validate::ValidationError;

#[derive(Debug, Clone)]
pub struct Post {
    id: uuid_v0::UUID,
    content: String,
    coordinate: Option<coordinate::Coordinate>,
}

impl Post {
    pub fn new(
        id: uuid_v0::UUID,
        content: String,
        coordinate: Option<coordinate::Coordinate>,
    ) -> Result<Self, ValidationError> {
        // Domain-level validation can be added here if needed. For now rely on value object validation.
        Ok(Self { id, content, coordinate })
    }

    pub fn id(&self) -> &uuid_v0::UUID {
        &self.id
    }

    pub fn content(&self) -> &str {
        &self.content
    }

    pub fn coordinate(&self) -> Option<&coordinate::Coordinate> {
        self.coordinate.as_ref()
    }
}
