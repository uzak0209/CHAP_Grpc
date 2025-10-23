use crate::domain::value_object::{coordinate, uuid_v0};

#[derive(Debug)]
struct Post {
    id: uuid_v0::UUID,
    content: String,
    coodinate: coordinate::Coordinate,
}
