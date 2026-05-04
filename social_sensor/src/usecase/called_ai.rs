use crate::domain::domain_service::{clustering, get_trend::get_trend};
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

    async fn called_ai(&self) -> AnyResult<String> {
        // Business logic can be added here
        let posts = self.postrepo.find_valid_post_entities().await?;
        let threads = self.threadrepo.find_valid_thread_entities().await?;
        let events = self.eventrepo.find_valid_event_entities().await?;
        Ok(format!(
            "CalledAIUsecase with posts: {:?}, threads: {:?}, events: {:?}",
            posts, threads, events
        ))
    }

    /// Use case for clustering data
    fn execute_clustering(
        tokenized_data: Vec<String>,
        model_path: &str,
        n_clusters: usize,
    ) -> Result<Vec<String>, anyhow::Error> {
        let clustering_result =
            clustering::process_and_cluster(tokenized_data, model_path, n_clusters)?;
        let trend = get_trend(clustering_result);
        return Ok(trend);
    }
}
