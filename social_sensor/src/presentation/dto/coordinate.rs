use serde::Serialize;
use crate::domain::composite::coordinate::Coordinate;

#[derive(Serialize)]
pub struct SimpleCoordinate {
    lat: f64,
    lng: f64,
}

impl From<Coordinate> for SimpleCoordinate {
    fn from(c: Coordinate) -> Self {
        Self {
            lat: *c.lat.get_value(),
            lng: *c.lng.get_value(),
        }
    }
}

#[derive(Serialize)]
pub struct Response {
    data: Vec<SimpleCoordinate>,
    ok: bool,
}