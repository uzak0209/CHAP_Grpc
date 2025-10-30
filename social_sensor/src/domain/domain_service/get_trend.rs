pub fn get_trend(clustering_result: Vec<Vec<String>>) -> Vec<String> {
    return clustering_result
        .into_iter()
        .max_by_key(|v| v.len())
        .unwrap_or_else(|| vec![String::new()]);
}
