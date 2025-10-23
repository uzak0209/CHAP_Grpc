use crate::domain::validate::{Validate, ValidationError};
use uuid::Uuid;
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UUID(String);

impl Validate for UUID {
    fn validate(&self) -> Result<(), ValidationError> {
        match Uuid::parse_str(&self.get_value()) {
            Ok(_) => Ok(()),
            Err(_) => Err(ValidationError::new("Invalid UUID format")),
        }
    }
}

impl UUID {
    pub fn new(value: String) -> Result<Self, ValidationError> {
        let uuid = UUID(value);
        uuid.validate()?;
        Ok(uuid)
    }
    pub fn get_value(&self) -> &String {
        &self.0
    }
}
