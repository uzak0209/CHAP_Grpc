use crate::domain::domain_service::clustering;

/// Use case for clustering data
pub fn execute_clustering(tokenized_data: Vec<String>, model_path: &str, n_clusters: usize) -> Result<Vec<usize>, anyhow::Error> {
    clustering::process_and_cluster(tokenized_data, model_path, n_clusters)
}