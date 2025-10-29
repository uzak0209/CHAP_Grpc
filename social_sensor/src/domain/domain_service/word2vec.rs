use anyhow::{Context, Result};
use finalfusion::prelude::*;
use linfa::dataset::DatasetBase;
use linfa::prelude::Predict;
use linfa::traits::Fit;
use linfa_clustering::KMeans;
use ndarray::Array1;
use ndarray::Array2;
use std::fs::File;
use std::io::BufReader;

pub struct Word2VecModel {
    embeddings: Embeddings<VocabWrap, StorageWrap>,
}

pub struct SphericalKMeansResult {
    pub words: Vec<String>,
    pub labels: Vec<usize>,
    pub centroids: Array2<f32>,
    pub samples: Array2<f32>, // L2 正規化済み
}

impl Word2VecModel {
    /// Word2Vec モデルをファイルから読み込む
    pub fn load(path: &str) -> Result<Self> {
        let f =
            File::open(path).with_context(|| format!("Failed to open word2vec model: {}", path))?;
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

    /// ベクトルの次元数を取得
    pub fn dims(&self) -> usize {
        self.embeddings.dims()
    }

    /// 高速クラスタリング: Spherical K-Means (コサイン類似度)
    pub fn spherical_kmeans(
        &self,
        words: &[String],
        k: usize,
        max_niter: usize,
    ) -> anyhow::Result<(Vec<String>, Vec<usize>)> {
        let res = self.spherical_kmeans_full(words, k, max_niter)?;
        Ok((res.words, res.labels))
    }

    /// 重心と正規化済みサンプルを含む完全版
    pub fn spherical_kmeans_full(
        &self,
        words: &[String],
        k: usize,
        max_niter: usize,
    ) -> anyhow::Result<SphericalKMeansResult> {
        // 単語→ベクトル（存在しない語は除外）
        let mut kept_words = Vec::new();
        let mut vectors: Vec<Vec<f32>> = Vec::new();
        for w in words {
            if let Some(v) = self.word_to_vec(w) {
                kept_words.push(w.clone());
                vectors.push(v);
            }
        }

        // 行列化 & L2正規化
        let n = vectors.len();
        if n == 0 {
            return Ok(SphericalKMeansResult {
                words: Vec::new(),
                labels: Vec::new(),
                centroids: Array2::zeros((0, 0)),
                samples: Array2::zeros((0, 0)),
            });
        }
        let d = vectors[0].len();
        let mut samples = Array2::<f32>::zeros((n, d));
        for (i, v) in vectors.iter().enumerate() {
            let mut norm = 0f32;
            for x in v {
                norm += x * x;
            }
            let norm = norm.sqrt().max(1e-12);
            for j in 0..d {
                samples[(i, j)] = v[j] / norm;
            }
        }

        let dataset = DatasetBase::from(samples.clone());
        let model = KMeans::params(k)
            .max_n_iterations(max_niter as u64)
            .fit(&dataset)?;
        let labels = model.predict(&dataset).to_vec();
        let mut centroids = model.centroids().to_owned();
        // 重心も L2 正規化してコサイン類似度の閾値と整合を取る
        for i in 0..centroids.nrows() {
            let mut norm = 0f32;
            for j in 0..centroids.ncols() {
                let v = centroids[(i, j)];
                norm += v * v;
            }
            let norm = norm.sqrt().max(1e-12);
            for j in 0..centroids.ncols() {
                centroids[(i, j)] /= norm;
            }
        }

        Ok(SphericalKMeansResult {
            words: kept_words,
            labels,
            centroids,
            samples,
        })
    }

    /// ベクトルの正規化
    fn normalize_vector(vector: &[f32]) -> Vec<f32> {
        let norm = vector.iter().map(|x| x * x).sum::<f32>().sqrt().max(1e-12);
        vector.iter().map(|x| x / norm).collect()
    }

    /// 単語リストをベクトルリストに変換
    pub fn words_to_vectors(&self, words: &[String]) -> Vec<Vec<f32>> {
        words
            .iter()
            .filter_map(|word| self.word_to_vec(word))
            .map(|vec| Self::normalize_vector(&vec))
            .collect()
    }

    /// クラスタリング用のデータセット作成
    pub fn create_dataset(&self, words: &[String]) -> Option<DatasetBase<Array2<f32>, Array1<()>>> {
        let vectors = self.words_to_vectors(words);
        if vectors.is_empty() {
            return None;
        }
        let n_samples = vectors.len();
        let n_features = vectors[0].len();
        let flat_vectors: Vec<f32> = vectors.into_iter().flatten().collect();
        let array = Array2::from_shape_vec((n_samples, n_features), flat_vectors).ok()?;
        // ラベルは不要（教師なし）なので unit ラベルの Dataset を作成
        Some(DatasetBase::from(array))
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
