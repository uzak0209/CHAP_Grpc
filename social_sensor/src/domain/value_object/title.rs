use crate::domain::validate::{Validate, ValidationError};

#[derive(Debug, Clone)]
pub struct Title(String);
impl Title {
    pub fn new(value: String) -> Result<Self, ValidationError> {
        // You can add validation logic here if needed

        let title = Title(value);
        title.validate()?;
        Ok(title)
    }

    pub fn value(&self) -> &str {
        &self.0
    }
}
impl std::fmt::Display for Title {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
impl Validate for Title {
    fn validate(&self) -> Result<(), ValidationError> {
        if self.0.trim().is_empty() {
            Err(ValidationError {
                message: "Title cannot be empty".to_string(),
            })
        } else if self.0.len() > 1000 {
            Err(ValidationError {
                message: "Title cannot exceed 1000 characters".to_string(),
            })
        } else {
            Ok(())
        }
    }
}
