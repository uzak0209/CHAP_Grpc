use crate::domain::validate::ValidationError;
use crate::domain::{composite::coordinate, value_object::uuid_v0};

#[derive(Debug, Clone)]
pub struct Event {
    id: uuid_v0::UUID,
    title: String,
    coordinate: Option<coordinate::Coordinate>,
}

impl Event {
    pub fn new(
        id: uuid_v0::UUID,
        title: String,
        coordinate: Option<coordinate::Coordinate>,
    ) -> Result<Self, ValidationError> {
        Ok(Self {
            id,
            title,
            coordinate,
        })
    }

    pub fn id(&self) -> &uuid_v0::UUID {
        &self.id
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn coordinate(&self) -> Option<&coordinate::Coordinate> {
        self.coordinate.as_ref()
    }
}
