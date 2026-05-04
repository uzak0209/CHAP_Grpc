use crate::{
    domain::{
        composite::coordinate::Coordinate,
        entity::{event::Event, post::Post, thread::Thread},
    },
    infra::repository::{
        event_repository::EventRepository, post_repository::PostRepository,
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

    let posts: Vec<_> = posts_entities
        .into_iter()
        .filter(|p| {
            set.iter().any(|s| p.content().contains(s))
        })
        .filter_map(|p| p.coordinate().cloned())
        .collect();

    let threads_entities: Vec<Thread> = thread_repository.find_valid_thread_entities().await?;
    let threads: Vec<_> = threads_entities
        .into_iter()
        .filter(|t| {
            set.iter().any(|s| t.title().value().contains(s))
        })
        .filter_map(|t| t.coordinate().cloned())
        .collect();

    let events_entities: Vec<Event> = event_repository.find_valid_event_entities().await?;
    let events: Vec<_> = events_entities
        .into_iter()
        .filter(|e| {
            set.iter().any(|s| e.title().value().contains(s))
        })
        .filter_map(|e| e.coordinate().cloned())
        .collect();

    println!(
        "Mapped clustering result:\n  posts: {:?}\n  threads: {:?}\n  events: {:?}",
        posts, threads, events
    );

    Ok(posts.into_iter().chain(threads).chain(events).collect())
}