use crate::domain::value_object::lat::Lat;
use crate::domain::value_object::lng::Lng;

#[derive(Debug)]
pub struct Coordinate {
    lat: Lat,
    lng: Lng,
}
