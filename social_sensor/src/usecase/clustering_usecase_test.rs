#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execute_clustering() {
        let tokenized_data = vec![
            vec![0.1, 0.2, 0.3],
            vec![0.4, 0.5, 0.6],
            vec![0.7, 0.8, 0.9],
        ];
        let n_clusters = 2;

        let result = execute_clustering(tokenized_data, n_clusters);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 3);
    }
}