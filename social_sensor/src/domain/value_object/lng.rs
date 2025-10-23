use crate::domain::validate::{Validate, ValidationError};
#[derive(Debug)]
pub struct Lng {
    value: f64,
}
impl Validate for Lng {
    fn validate(&self) -> Result<(), ValidationError> {
        if *self.get_value() < -180.0 || *self.get_value() > 180.0 {
            return Err(ValidationError::new(
                "Longitude must be between -180 and 180 degrees",
            ));
        }
        Ok(())
    }
}
impl Lng {
    pub fn new(value: f64) -> Result<Self, ValidationError> {
        let lng = Lng { value };
        lng.validate()?;
        Ok(lng)
    }

    pub fn get_value(&self) -> &f64 {
        &self.value
    }
}
