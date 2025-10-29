use crate::domain::domain_service::{clustering, get_trend::get_trend};

/// Use case for clustering data
pub fn execute_clustering(
    tokenized_data: Vec<String>,
    model_path: &str,
    n_clusters: usize,
) -> Result<Vec<String>, anyhow::Error> {
    let clustering_result =
        clustering::process_and_cluster(tokenized_data, model_path, n_clusters)?;
    let trend = get_trend(clustering_result);
    return Ok(trend);
}
