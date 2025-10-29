use crate::domain::{
    composite::coordinate::Coordinate,
    entity::{event::Event, post::Post, thread::Thread},
    value_object::uuid_v0::UUID,
};
#[derive(Debug, Clone)]
enum ClusteringResult {
    Post(Coordinate),
    Thread(Coordinate),
    Event(Coordinate),
}
use std::collections::HashSet;

fn map_clustering_result(
    posts: Vec<Post>,
    threads: Vec<Thread>,
    events: Vec<Event>,
    clustering_result: Vec<String>,
) -> Vec<ClusteringResult> {
    let set: HashSet<_> = clustering_result.into_iter().collect();

    let posts = posts
        .into_iter()
        .filter(|p| set.contains(p.content()))
        .map(|p| ClusteringResult::Post(p.coordinate().unwrap().clone()));

    let threads = threads
        .into_iter()
        .filter(|t| set.contains(t.title().value()))
        .map(|t| ClusteringResult::Thread(t.coordinate().unwrap().clone()));

    let events = events
        .into_iter()
        .filter(|e| set.contains(e.title().value()))
        .map(|e| ClusteringResult::Event(e.coordinate().unwrap().clone()));

    posts.chain(threads).chain(events).collect()
}
