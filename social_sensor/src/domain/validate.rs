use std::fmt;

pub trait Validate {
    fn validate(&self) -> Result<(), ValidationError>;
    // add code heri
}
#[derive(Debug)]
pub struct ValidationError {
    pub message: String,
}
impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "ValidationError: {}", self.message)
    }
}
impl std::error::Error for ValidationError {}
impl ValidationError {
    pub fn new(message: &str) -> Self {
        ValidationError {
            message: message.to_string(),
        }
    }
}
