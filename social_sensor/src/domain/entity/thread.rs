use crate::domain::{composite::coordinate::Coordinate, value_object::{title::Title, uuid_v0}};
use crate::domain::validate::ValidationError;

#[derive(Debug, Clone)]
pub struct Thread {
    id: uuid_v0::UUID,
    title: Title,
    coordinate: Option<Coordinate>,
}

impl Thread {
    pub fn new(id: uuid_v0::UUID, title: Title, coordinate: Option<Coordinate>) -> Result<Self, ValidationError> {
        Ok(Self { id, title, coordinate })
    }

    pub fn id(&self) -> &uuid_v0::UUID {
        &self.id
    }

    pub fn title(&self) -> &Title {
        &self.title
    }

    pub fn coordinate(&self) -> Option<&Coordinate> {
        self.coordinate.as_ref()
    }
}
