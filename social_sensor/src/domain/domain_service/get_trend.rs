pub fn get_trend(clustering_result: Vec<Vec<String>>) -> Vec<String> {
    return clustering_result
        .into_iter()
        .max_by_key(|v| v.len())
        .unwrap_or_else(|| vec![String::new()]);
}

#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;

    #[rstest]
    #[case(vec![vec!["a".to_string(), "b".to_string()], vec!["c".to_string()]])]
    fn test_get_trend_returns_largest_cluster(#[case] input: Vec<Vec<String>>) {
        let res = get_trend(input);
        assert_eq!(res, vec!["a".to_string(), "b".to_string()]);
    }

    #[rstest]
    #[case(vec![])]
    fn test_get_trend_empty(#[case] input: Vec<Vec<String>>) {
        let res = get_trend(input);
        assert_eq!(res, vec![String::new()]);
    }
}
