use crate::{
    domain::{
        composite::coordinate::Coordinate,
        entity::{event::Event, post::Post, thread::Thread},
    },
    infra::repository::{
        self, event_repository::EventRepository, post_repository::PostRepository,
        thread_repository::ThreadRepository,
    },
};
use anyhow::Result;
use std::collections::HashSet;

pub async fn map_clustering_result(
    post_repository: &PostRepository,
    event_repository: &EventRepository,
    thread_repository: &ThreadRepository,
    clustering_result: Vec<String>,
) -> Result<Vec<Coordinate>> {
    let set: HashSet<_> = clustering_result.into_iter().collect();
    let posts_entities: Vec<Post> = post_repository.find_valid_post_entities().await?;

    let posts = posts_entities
        .into_iter()
        .filter(|p| set.contains(p.content()))
        .map(|p| p.coordinate().unwrap().clone());

    let threads_entities: Vec<Thread> = thread_repository.find_valid_thread_entities().await?;
    let threads = threads_entities
        .into_iter()
        .filter(|t| set.contains(t.title().value()))
        .map(|t| t.coordinate().unwrap().clone());

    let events_entities: Vec<Event> = event_repository.find_valid_event_entities().await?;
    let events = events_entities
        .into_iter()
        .filter(|e| set.contains(e.title().value()))
        .map(|e| e.coordinate().unwrap().clone());

    Ok(posts.chain(threads).chain(events).collect())
}
