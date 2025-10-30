use serde::{Deserialize, Serialize};

use crate::domain::validate::{Validate, ValidationError};
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Lat {
    value: f64,
}
impl Validate for Lat {
    fn validate(&self) -> Result<(), ValidationError> {
        if *self.get_value() < -90.0 || *self.get_value() > 90.0 {
            return Err(ValidationError::new(
                "Latitude must be between -90 and 90 degrees",
            ));
        }
        Ok(())
    }
}

impl Lat {
    pub fn new(value: f64) -> Result<Self, ValidationError> {
        let lat = Lat { value };
        lat.validate()?;
        Ok(lat)
    }

    pub fn get_value(&self) -> &f64 {
        &self.value
    }
}
