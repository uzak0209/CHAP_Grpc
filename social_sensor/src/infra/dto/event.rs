use crate::domain::entity::event;
use crate::domain::validate::ValidationError;
use crate::domain::value_object::title::Title;
use crate::domain::{
    composite::coordinate::Coordinate,
    entity::event::Event,
    value_object::uuid_v0,
    value_object::{lat, lng},
};
use crate::infra::model::event_db_models;
use rust_decimal::prelude::ToPrimitive;
use std::convert::TryFrom;

impl TryFrom<event_db_models::Model> for Event {
    type Error = ValidationError;

    fn try_from(model: event_db_models::Model) -> Result<Event, ValidationError> {
        let id = uuid_v0::UUID::new(model.id)?;
        let content = Title::new(model.content)?;
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
        
        event::Event::new(id, content, coordinate)
    }
}
