use crate::domain::value_object::{title::Title, uuid_v0};

struct Thread {
    id: uuid_v0::UUID,
    title: Title,
}
