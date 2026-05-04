use crate::domain::validate::ValidationError;
use crate::domain::value_object::title::Title;
use crate::domain::{composite::coordinate, value_object::uuid_v0};

#[derive(Debug, Clone)]
pub struct Event {
    id: uuid_v0::UUID,
    title: Title,
    coordinate: Option<coordinate::Coordinate>,
}

impl Event {
    pub fn new(
        id: uuid_v0::UUID,
        title: Title,
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

    pub fn title(&self) -> &Title {
        &self.title
    }
    pub fn value(&self) -> &Title {
        &self.title
    }
    pub fn coordinate(&self) -> Option<&coordinate::Coordinate> {
        self.coordinate.as_ref()
    }
}
