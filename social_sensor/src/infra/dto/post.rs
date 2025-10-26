use crate::domain::validate::ValidationError;
use crate::{
    domain::{
        composite::coordinate::{self, Coordinate},
        entity::post::{self, Post},
        value_object::uuid_v0,
        value_object::{lat, lng},
    },
    infra::model::post_db_models,
};
use rust_decimal::prelude::ToPrimitive;
use std::convert::TryFrom;

impl TryFrom<post_db_models::Model> for Post {
    type Error = ValidationError;

    fn try_from(model: post_db_models::Model) -> Result<Post, ValidationError> {
        let id = uuid_v0::UUID::new(model.id)?;
        let content = model.content;

        // build optional coordinate only if both lat and lng present
        let coordinate = match (model.lat, model.lng) {
            (Some(la), Some(lo)) => {
                let lat_f = la
                    .to_f64()
                    .ok_or_else(|| ValidationError::new("invalid lat decimal"))?;
                let lng_f = lo
                    .to_f64()
                    .ok_or_else(|| ValidationError::new("invalid lng decimal"))?;
                let lat_vo = lat::Lat::new(lat_f)?;
                let lng_vo = lng::Lng::new(lng_f)?;
                Some(Coordinate {
                    lat: lat_vo,
                    lng: lng_vo,
                })
            }
            _ => None,
        };

        post::Post::new(id, content, coordinate)
    }
}
