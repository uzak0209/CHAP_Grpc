use crate::domain::value_object::{lat::Lat, lng::Lng};

#[derive(Debug, Clone)]
pub struct Coordinate {
    pub lat: Lat,
    pub lng: Lng,
}

