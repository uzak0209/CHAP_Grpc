use anyhow::{Context, Result};
use finalfusion::prelude::*;
use finalfusion::vocab::Vocab;
use std::fs::File;
use std::io::BufReader;

pub struct Word2VecModel {
    embeddings: Embeddings<VocabWrap, StorageWrap>,
}

impl Word2VecModel {
    /// Word2Vec モデルをファイルから読み込む
    pub fn load(path: &str) -> Result<Self> {
        let f = File::open(path)
            .with_context(|| format!("Failed to open word2vec model: {}", path))?;
        let mut reader = BufReader::new(f);
        let embeddings = Embeddings::read_embeddings(&mut reader)
            .with_context(|| "Failed to read embeddings")?;
        
        Ok(Self { embeddings })
    }

    /// 単語をベクトルに変換
    pub fn word_to_vec(&self, word: &str) -> Option<Vec<f32>> {
        self.embeddings.embedding(word).map(|e| e.to_vec())
    }

    /// 複数の単語の平均ベクトルを取得
    pub fn words_to_vec(&self, words: &[String]) -> Option<Vec<f32>> {
        let mut sum: Option<Vec<f32>> = None;
        let mut count = 0;

        for word in words {
            if let Some(vec) = self.word_to_vec(word) {
                if sum.is_none() {
                    sum = Some(vec);
                } else if let Some(ref mut s) = sum {
                    for (i, val) in vec.iter().enumerate() {
                        s[i] += val;
                    }
                }
                count += 1;
            }
        }

        if count > 0 {
            sum.map(|mut s| {
                for val in s.iter_mut() {
                    *val /= count as f32;
                }
                s
            })
        } else {
            None
        }
    }

    /// 類似単語を検索
    pub fn similar_words(&self, word: &str, limit: usize) -> Option<Vec<(String, f32)>> {
        // クエリ単語の埋め込みを取得
        let query_embedding = self.embeddings.embedding(word)?;
        
        // 全単語に対してコサイン類似度を計算
        let mut similarities: Vec<(String, f32)> = Vec::new();
        
        // 語彙内の全単語をイテレート
        for word_str in self.embeddings.vocab().words().iter() {
            if word_str == word {
                continue; // クエリ単語自身はスキップ
            }
            
            if let Some(embedding) = self.embeddings.embedding(word_str) {
                // コサイン類似度を計算（ndarrayをスライスに変換）
                let similarity = cosine_similarity(query_embedding.as_slice().unwrap(), 
                                                   embedding.as_slice().unwrap());
                similarities.push((word_str.to_string(), similarity));
            }
        }
        
        // 類似度でソート（降順）
        similarities.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        
        // 上位limit件を返す
        Some(similarities.into_iter().take(limit).collect())
    }

    /// ベクトルの次元数を取得
    pub fn dims(&self) -> usize {
        self.embeddings.dims()
    }

    /// 単語リスト間のコサイン類似度行列を計算
    pub fn similarity_matrix(&self, words: &[String]) -> Vec<Vec<(String, String, f32)>> {
        let mut matrix = Vec::new();
        
        for (i, word1) in words.iter().enumerate() {
            let mut row = Vec::new();
            if let Some(vec1) = self.word_to_vec(word1) {
                for (j, word2) in words.iter().enumerate() {
                    if i < j { // 上三角行列のみ計算（対称性を利用）
                        if let Some(vec2) = self.word_to_vec(word2) {
                            let similarity = cosine_similarity(&vec1, &vec2);
                            row.push((word1.clone(), word2.clone(), similarity));
                        }
                    }
                }
            }
            if !row.is_empty() {
                matrix.push(row);
            }
        }
        
        matrix
    }

    /// 簡易的な階層的クラスタリング（最近隣法）
    pub fn hierarchical_clustering(&self, words: &[String], threshold: f32) -> Vec<Vec<String>> {
        let mut clusters: Vec<Vec<String>> = words.iter()
            .filter_map(|w| {
                if self.word_to_vec(w).is_some() {
                    Some(vec![w.clone()])
                } else {
                    None
                }
            })
            .collect();
        
        loop {
            let mut max_similarity = -1.0;
            let mut merge_indices: Option<(usize, usize)> = None;
            
            // 最も類似度の高いクラスタペアを探す
            for i in 0..clusters.len() {
                for j in (i + 1)..clusters.len() {
                    let sim = self.cluster_similarity(&clusters[i], &clusters[j]);
                    if sim > max_similarity {
                        max_similarity = sim;
                        merge_indices = Some((i, j));
                    }
                }
            }
            
            // しきい値以下なら終了
            if max_similarity < threshold {
                break;
            }
            
            // クラスタをマージ
            if let Some((i, j)) = merge_indices {
                let mut cluster_j = clusters.remove(j);
                clusters[i].append(&mut cluster_j);
            } else {
                break;
            }
        }
        
        clusters
    }

    /// 2つのクラスタ間の類似度を計算（平均リンク法）
    fn cluster_similarity(&self, cluster1: &[String], cluster2: &[String]) -> f32 {
        let mut sum = 0.0;
        let mut count = 0;
        
        for word1 in cluster1 {
            if let Some(vec1) = self.word_to_vec(word1) {
                for word2 in cluster2 {
                    if let Some(vec2) = self.word_to_vec(word2) {
                        sum += cosine_similarity(&vec1, &vec2);
                        count += 1;
                    }
                }
            }
        }
        
        if count > 0 {
            sum / count as f32
        } else {
            -1.0
        }
    }
}

/// コサイン類似度を計算
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot_product / (norm_a * norm_b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore] // モデルファイルが必要なのでデフォルトではスキップ
    fn test_word_to_vec() {
        let model = Word2VecModel::load("models/word2vec.bin").unwrap();
        
        let vec = model.word_to_vec("東京");
        assert!(vec.is_some());
        
        if let Some(v) = vec {
            println!("東京のベクトル次元数: {}", v.len());
        }
    }
}
