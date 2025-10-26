use crate::infra::repository::{
    event_repository::EventRepository, post_repository::PostRepository,
    thread_repository::ThreadRepository,
};
use anyhow::Result as AnyResult;

pub struct CalledAIUsecase {
    pub postrepo: PostRepository,
    pub threadrepo: ThreadRepository,
    pub eventrepo: EventRepository,
}

impl CalledAIUsecase {
    pub fn new(
        postrepo: PostRepository,
        threadrepo: ThreadRepository,
        eventrepo: EventRepository,
    ) -> Self {
        CalledAIUsecase {
            postrepo,
            threadrepo,
            eventrepo,
        }
    }

    pub async fn called_ai(&self) -> AnyResult<String> {
        // Business logic can be added here
        let posts = self.postrepo.find_valid_post_entities().await?;
        let threads = self.threadrepo.find_valid_thread_entities().await?;
        let events = self.eventrepo.find_valid_event_entities().await?;
        Ok(format!(
            "CalledAIUsecase with posts: {:?}, threads: {:?}, events: {:?}",
            posts, threads, events
        ))
    }
}
