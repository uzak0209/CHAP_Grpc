use crate::domain::validate::ValidationError;
use crate::{
    domain::{
        composite::coordinate::Coordinate, entity::thread::Thread, value_object::lat,
        value_object::lng, value_object::title, value_object::uuid_v0,
    },
    infra::model::thread_db_models,
};
use rust_decimal::prelude::ToPrimitive;
use std::convert::TryFrom;

impl TryFrom<thread_db_models::Model> for Thread {
    type Error = ValidationError;

    fn try_from(model: thread_db_models::Model) -> Result<Thread, ValidationError> {
        let id = uuid_v0::UUID::new(model.id)?;
        let title = title::Title::new(model.content)?;

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

        Thread::new(id, title, coordinate)
    }
}
