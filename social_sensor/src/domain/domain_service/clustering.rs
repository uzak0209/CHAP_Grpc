use std::collections::HashSet;

use crate::domain::domain_service::tokenizer::tokenizer;
use crate::domain::domain_service::word2vec::Word2VecModel;

fn main() -> Result<(), anyhow::Error> {
    // Word2Vec モデルを読み込む
    let model = Word2VecModel::load("chive-1.3-mc100-dim50.fifu")?;
    println!("モデル読み込み完了！");
    println!("ベクトル次元数: {}", model.dims());
    println!();
    let text = "
コレステロール研究の歴史的出来事が時系列でまとめられている。
数学すうがく英希は数量構造空間変化のパターンを研究する学問である数学者はこれらの概念の性質を抽象化し論理的推論を用いて定理を導く数学は自然科学工学経済学医学社会科学など多くの分野で応用されるまた数学的構造や概念は芸術や哲学においても重要な役割を果たしている古代から数学は実用的目的と純粋な探求心の両方によって発展してきた古代エジプトやメソポタミアでは測量や暦の作成商取引などのために算術や幾何学が用いられた古代ギリシアではピタゴラスやユークリッドらによって論理的体系としての数学が確立された中世イスラム世界では代数学や三角法が発展しその成果がルネサンス期のヨーロッパに伝わった近代になるとニュートンやライプニッツによって微積分が創始され力学や物理学と密接に結びついたさらに世紀以降集合論や非ユークリッド幾何学確率論などが誕生し数学はより抽象的かつ体系的な学問へと発展した現代ではコンピュータの発達により計算数学数値解析暗号理論機械学習など新たな分野が急速に広がっているまた純粋数学においても位相幾何学や圏論解析学代数学幾何学の統合などが進み数学全体の構造がより深く理解されつつある数学はしばしば厳密さ論理的整合性普遍性の象徴とされる一方で創造性や直感も重要な役割を果たす数学的発見の過程は芸術的とも評されることがある
数学の応用は極めて広範囲に及ぶ自然科学においては物理学化学生物学地球科学などで数量的解析やモデル化の基礎として不可欠である物理学では微積分や線形代数が運動や力エネルギーの記述に用いられ化学では化学反応や分子構造の理解に数学的手法が使われる生物学では遺伝子解析や進化モデル生態系シミュレーションなどで統計学や数理モデルが活用されている社会科学では経済学心理学社会学政治学などにおいて数理的分析が行われる経済学では最適化理論やゲーム理論統計的推定が中心的な役割を持つまた情報技術分野では離散数学や論理代数確率論がアルゴリズム暗号理論人工知能などの基盤を支えている工学においても制御理論信号処理数値解析などの数学的応用が不可欠であるこれらの分野では数学的理論が現実世界の問題解決に直接寄与している一方で純粋数学は応用を意識せず理論の内部的整合性や美的構造を追求するその結果として得られた理論が後に思いがけない応用をもたらすことも多い例えば数論の一部として発展した楕円曲線理論は現代の暗号技術の中核となっているまたフーリエ解析や線形代数は当初純粋数学として発展したが現在では画像処理音声解析機械学習など多くの分野で欠かせない手法となっている

数学の分野は大きく純粋数学応用数学統計学計算数学などに分類される純粋数学には代数学解析学幾何学トポロジー数論などが含まれ抽象構造や論理的一貫性を重視する応用数学は現実世界の問題に数学を適用することを目的とし物理学経済学工学などとの境界領域を形成している統計学はデータからの推論や不確実性の定量化を扱い科学的調査や社会政策において不可欠である計算数学は数値計算法やアルゴリズムの理論を中心に発展しコンピュータ科学と密接に関係しているまた数学は論理学哲学言語学芸術など人文科学にも影響を与えておりその思想的側面も重要視されている
数学の哲学は数学とは何かその対象は実在するのかという根本的問いを扱う代表的な立場としてプラトン主義形式主義構成主義論理主義などがあるプラトン主義は数学的対象が人間の意識とは独立して存在すると考えるのに対し形式主義は数学を公理と推論規則によって定義された形式的体系とみなす構成主義は数学的対象は人間の心的活動によってのみ構成されるとする論理主義は数学を論理に還元できると主張するこれらの立場は互いに異なる観点から数学の本質を説明しようとする試みであり現代においても議論が続いている

数学教育は知識や技能の習得だけでなく論理的思考力創造性問題解決能力を育てることを目的とする初等教育では数と計算図形測定などの基本的概念を学び中等教育では代数幾何解析確率統計などより高度な内容を扱う高等教育では専門分野ごとの体系的学習や研究が行われるまた数学的リテラシーは現代社会におけるデータ理解や合理的意思決定に不可欠な能力とされる近年ではプログラミング教育やデータサイエンス教育との連携が重視されつつある

数学は文化の一部としても重要な位置を占めている芸術においては対称性比例フラクタル幾何など数学的概念が美的表現に応用されている音楽ではリズムや音階に数学的構造が見出され建築やデザインでも幾何学的調和が重視されるさらに文学や哲学でも数学的比喩や構造が用いられることがあるこのように数学は人類の知的文化的活動の根幹を成す学問の一つであり論理と創造の融合として普遍的価値を持つ

".to_string();
    let tokens = tokenizer(text.clone()).unwrap_or_default();
    println!("入力テキスト: {}", text);
    println!("トークン: {}", tokens.join(" "));
    println!();

    // 高速クラスタリング: Spherical K-Means + 類似度フィルタ
    println!("=== Spherical K-Means による高速クラスタリング（厳しめ） ===");
    // トークン数に応じてクラスタ数を自動決定（ユニーク×語彙ヒットに基づく）
    let uniq: std::collections::HashSet<&str> = tokens.iter().map(|s| s.as_str()).collect();
    let mut kept_unique = 0usize;
    for t in &uniq {
        if model.word_to_vec(t).is_some() {
            kept_unique += 1;
        }
    }
    let mut k = ((kept_unique as f32) / 25.0).ceil() as usize; // おおよそ1クラスタ25語
    if k < 8 {
        k = 8;
    }
    if k > 64 {
        k = 64;
    }
    if kept_unique >= 2 && k >= kept_unique {
        k = kept_unique.saturating_sub(1).max(2).min(64);
    }
    println!("ユニーク語彙(ヒット): {}, k={}", kept_unique, k);
    let iters = 100; // 反復回数
    let sim_threshold = 0.86; // コサイン類似度の下限（厳しさとカバレッジのバランス）
    let margin = 0.06; // 1位と2位の重心スコアの最小差（曖昧割当の除外）
    let relaxed_threshold = 0.80; // 二段階目の緩いしきい値（マージンなし）
    let fallback_threshold = 0.74; // 三段目の最終しきい値（マージンなし）
    let res = model.spherical_kmeans_full(&tokens, k, iters)?;

    // クラスタごとに出力（しきい値 + マージンを満たさないものは除外）。重複語もそのまま保持。
    let mut clusters: Vec<Vec<String>> = vec![Vec::new(); k];
    let mut assigned_cnt = 0usize;
    let mut _below_thr_cnt = 0usize;
    let mut ambiguous_cnt = 0usize;
    let mut relaxed_cnt = 0usize;
    let mut fallback_cnt = 0usize;
    let mut forced_cnt = 0usize;
    let mut below_thr_samples: Vec<String> = Vec::new();
    let mut ambiguous_samples: Vec<String> = Vec::new();
    let mut relaxed_samples: Vec<String> = Vec::new();
    let mut fallback_samples: Vec<String> = Vec::new();
    let mut forced_samples: Vec<String> = Vec::new();
    // 1段目: 厳格割当
    let mut assigned_mask = vec![false; res.words.len()];
    for (idx, w) in res.words.iter().enumerate() {
        // 全重心との内積（=コサイン）を計算し、1位と2位を取得
        let mut best_label = 0usize;
        let mut best = f32::NEG_INFINITY;
        let mut second = f32::NEG_INFINITY;
        for lab in 0..k {
            let mut dot = 0f32;
            for j in 0..res.samples.ncols() {
                dot += res.samples[[idx, j]] * res.centroids[[lab, j]];
            }
            if dot > best {
                second = best;
                best = dot;
                best_label = lab;
            } else if dot > second {
                second = dot;
            }
        }
        if best >= sim_threshold && (best - second) >= margin {
            clusters[best_label].push(w.clone());
            assigned_cnt += 1;
            assigned_mask[idx] = true;
        } else if best < sim_threshold {
            _below_thr_cnt += 1;
            if below_thr_samples.len() < 30 {
                below_thr_samples.push(w.clone());
            }
        } else {
            ambiguous_cnt += 1;
            if ambiguous_samples.len() < 30 {
                ambiguous_samples.push(w.clone());
            }
        }
    }

    // 2段目: 緩め割当（未割当のみ、マージンなしでしきい値を少し下げる）
    for (idx, w) in res.words.iter().enumerate() {
        if assigned_mask[idx] {
            continue;
        }
        let mut best_label = 0usize;
        let mut best = f32::NEG_INFINITY;
        for lab in 0..k {
            let mut dot = 0f32;
            for j in 0..res.samples.ncols() {
                dot += res.samples[[idx, j]] * res.centroids[[lab, j]];
            }
            if dot > best {
                best = dot;
                best_label = lab;
            }
        }
        if best >= relaxed_threshold {
            clusters[best_label].push(w.clone());
            relaxed_cnt += 1;
            assigned_mask[idx] = true;
            if relaxed_samples.len() < 30 {
                relaxed_samples.push(w.clone());
            }
        }
    }

    // 3段目: 最終フォールバック（未割当のみ、さらに低いしきい値で拾う）
    for (idx, w) in res.words.iter().enumerate() {
        if assigned_mask[idx] {
            continue;
        }
        let mut best_label = 0usize;
        let mut best = f32::NEG_INFINITY;
        for lab in 0..k {
            let mut dot = 0f32;
            for j in 0..res.samples.ncols() {
                dot += res.samples[[idx, j]] * res.centroids[[lab, j]];
            }
            if dot > best {
                best = dot;
                best_label = lab;
            }
        }
        if best >= fallback_threshold {
            clusters[best_label].push(w.clone());
            fallback_cnt += 1;
            assigned_mask[idx] = true;
            if fallback_samples.len() < 30 {
                fallback_samples.push(w.clone());
            }
        }
    }

    // 4段目: 強制割当（全件を最も近い重心へ割当）。品質表示のため別カウント。
    for (idx, w) in res.words.iter().enumerate() {
        if assigned_mask[idx] {
            continue;
        }
        let mut best_label = 0usize;
        let mut best = f32::NEG_INFINITY;
        for lab in 0..k {
            let mut dot = 0f32;
            for j in 0..res.samples.ncols() {
                dot += res.samples[[idx, j]] * res.centroids[[lab, j]];
            }
            if dot > best {
                best = dot;
                best_label = lab;
            }
        }
        clusters[best_label].push(w.clone());
        forced_cnt += 1;
        assigned_mask[idx] = true;
        if forced_samples.len() < 30 {
            forced_samples.push(w.clone());
        }
    }

    for (i, items) in clusters.iter().enumerate() {
        if !items.is_empty() {
            println!(
                "クラスタ {:02}: {} 件\n  {}\n",
                i,
                items.len(),
                items.join(" ")
            );
        }
    }

    // 集計の表示
    let total_in_vocab = res.words.len();
    let mut uniq = HashSet::new();
    for items in &clusters {
        for w in items {
            uniq.insert(w.clone());
        }
    }
    let total_assigned = assigned_cnt + relaxed_cnt + fallback_cnt + forced_cnt;
    if !below_thr_samples.is_empty() {
        println!("  例: {}", below_thr_samples.join(" "));
    }
    println!("未割当(曖昧: マージン未満): {}", ambiguous_cnt);
    if !ambiguous_samples.is_empty() {
        println!("  例: {}", ambiguous_samples.join(" "));
    }
    let remaining_unassigned = total_in_vocab.saturating_sub(total_assigned);
    println!("最終未割当: {}", remaining_unassigned);
    if !relaxed_samples.is_empty() {
        println!("2段目で採択された例: {}", relaxed_samples.join(" "));
    }
    if !fallback_samples.is_empty() {
        println!("3段目で採択された例: {}", fallback_samples.join(" "));
    }
    if !forced_samples.is_empty() {
        println!("4段目(強制)で採択された例: {}", forced_samples.join(" "));
    }

    Ok(())
}

use linfa_clustering::KMeans;
use linfa::traits::Fit;
use linfa::prelude::Predict;
use anyhow::Result;

pub fn process_and_cluster(texts: Vec<String>, model_path: &str, n_clusters: usize) -> Result<Vec<usize>> {
    // 1. トークナイズ
    let tokenized: Vec<Vec<String>> = texts.into_iter().map(|text| tokenizer(text).unwrap_or_default()).collect();

    // 2. Word2Vec モデルのロード
    let model = Word2VecModel::load(model_path)?;

    // 3. ベクトル化
    let words: Vec<String> = tokenized.into_iter().flatten().collect();
    let dataset = model.create_dataset(&words).ok_or_else(|| anyhow::anyhow!("No valid vectors for clustering"))?;

    // 4. クラスタリング
    let kmeans = KMeans::params(n_clusters).fit(&dataset)?;
    Ok(kmeans.predict(&dataset).to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_and_cluster() {
        let texts = vec![
            "Rust is a systems programming language".to_string(),
            "Machine learning is fascinating".to_string(),
            "Clustering algorithms group data".to_string(),
        ];
        let model_path = "models/word2vec.bin";
        let n_clusters = 2;

        let result = process_and_cluster(texts, model_path, n_clusters);
        assert!(result.is_ok());
        let labels = result.unwrap();
        assert_eq!(labels.len(), 3); // 3 texts should result in 3 labels
    }
}
