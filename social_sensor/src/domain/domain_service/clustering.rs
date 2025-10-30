use crate::domain::domain_service::heatmap;
use crate::domain::domain_service::tokenizer::tokenizer;
use crate::domain::domain_service::word2vec::Word2VecModel;
use anyhow::Result;
use linfa::dataset::DatasetBase;
use linfa::prelude::Predict;
use linfa::traits::Fit;
use linfa_clustering::KMeans;
use ndarray::Array2;

pub fn process_and_cluster(
    texts: Vec<String>,
    model_path: &str,
    n_clusters: usize,
) -> Result<Vec<Vec<String>>> {
    // 1. トークナイズ
    let tokenized: Vec<Vec<String>> = texts
        .into_iter()
        .map(|text| tokenizer(text).unwrap_or_default())
        .collect();

    // 2. 単語をフラット化
    let words_all: Vec<String> = tokenized.into_iter().flatten().collect();
    if words_all.is_empty() {
        return Err(anyhow::anyhow!("No words to process"));
    }

    // 3. Word2Vec モデルロード
    let model = Word2VecModel::load(model_path)?;

    // 4. 単語 -> ベクトル (存在しない単語は除外)
    let mut kept_words: Vec<String> = Vec::new();
    let mut vectors: Vec<Vec<f32>> = Vec::new();
    for w in &words_all {
        if let Some(v) = model.word_to_vec(w) {
            kept_words.push(w.clone());
            vectors.push(v);
        }
    }

    if vectors.is_empty() {
        return Err(anyhow::anyhow!("No valid vectors for clustering"));
    }

    // 5. Vec<Vec<f32>> -> ndarray::Array2<f32>
    let n = vectors.len();
    let d = vectors[0].len();
    let flat: Vec<f32> = vectors.into_iter().flatten().collect();
    let array = Array2::from_shape_vec((n, d), flat)
        .map_err(|e| anyhow::anyhow!(format!("Failed to create array: {}", e)))?;

    // 6. Dataset を作成して KMeans に渡す
    let dataset: DatasetBase<_, _> = DatasetBase::from(array.clone());
    let kmeans_model = KMeans::params(n_clusters).fit(&dataset)?;
    let labels = kmeans_model.predict(&dataset).to_vec();

    // 7. クラスタごとに単語を格納
    let mut clusters: Vec<Vec<String>> = vec![Vec::new(); n_clusters];
    for (word, label) in kept_words.into_iter().zip(labels.into_iter()) {
        if label < clusters.len() {
            clusters[label].push(word);
        }
    }

    Ok(clusters)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_and_cluster() {
        let texts = vec![
            "災害とは、自然現象や人為的な原因によって、人命や社会生活に被害が生じる事態を指す。

「災害」と呼ばれるのは、人間に影響を及ぼす事態に限られる。例えば、洪水や土砂崩れが発生しても、そこにだれも住んでいなければ被害や損失を受ける者は出ないため、それは災害とは呼ばない。また「災害」という用語は多くの場合、自然現象に起因する自然災害を指すが、人為的な原因による事故や事件も災害に含むことがある。通常は、人間生活が破壊されて何らかの援助を必要とする程の規模のものを指し、それに満たない規模の人災は除かれる。

自然災害の性質として、災害の元となる事象を制御することができないことが挙げられる。地震や大雨という現象自体は止めることができない。人工降雨も研究されているが、干ばつを防ぐほどの技術力には未だ達していない。一方、火事や交通事故はそれ自体人間によるものであり、人間による制御がある程度利く事象である。これが、自然災害と人為的災害の相違点である。

ただし、事件や事故と災害の使い分けは必ずしも明確ではない。政治や行政、社会学的観点からは、自然災害および社会的影響が大きな人的災害を災害と考える。一方、労働安全の場面や安全工学の観点においては、その大小や原因に関わらず人的被害をもたらす事態を災害と考える。

災害の要因は大きく二つある。災害をもたらすきっかけとなる現象、例えば地震や洪水のような外力を誘因と言う。これに対して、社会が持つ災害への脆弱性、例えば都市の人口集積、あるいは建物の耐震性や救助能力を素因と言う。災害は、誘因が素因に作用して起こるものであり、防災力を超える外力に見舞われた時に災害が生じると考えることができる。この外力は確率的な現象であり、規模の大きなものほど頻度が低くなる。そのため、絶対安全は有り得ないことが分かる。そして、誘因をよく理解するとともに、素因である脆弱性を低減させること、ことが被害を低減させる。

例えば、1995年に発生した兵庫県南部地震では六千人以上の死者が出たが、五年後に発生した鳥取県西部地震では死者が出なかった。これは、阪神間という都市への人口集中が社会の混乱の規模、つまり脆弱性を増大させていたことを示している。単に外力が大きければ大きな災害になると思われがちであるが、実は、外力が同じ規模でも、社会の脆弱性や防災力の高さが災害の様相を大きく変えるのである。またこのことから、自然災害に分類される災害においても人為的な要因が大なり小なり存在することが分かる。

災害により被害を受けた地域を被災地、被害を受けたものを被災者という。1993年に採択されたウィーン宣言及び行動計画では、自然災害と人的災害について言及し、国際連合憲章と国際人道法の原則に従って、被災者に人道支援を行うことの重要性を強調している。

なお、災害の程度に応じて非常事態や緊急事態と言う場合もある。これは、政府や行政が通常時とは異なる特別な法制度に基づいた行動に切り替える非常事態宣言のように、通常時とは異なる社会システムへの切り替えを必要とするような激しい災害を指す。

競馬は、騎手が乗った馬により競われる競走競技であり、その着順を予想する賭博である。イギリスを発祥とする近代競馬は多くの国々で開催されており、その多くは勝馬投票券の販売とセットの興行として行われている。

競馬は主に競馬場と呼ばれる専用の競技場で開催される。一つ一つの競い合いを競走と呼び、一日の競馬開催でいくつかの競走が行われる。競走の種類は、平坦なコースを走る平地競走、障害物の飛越を伴う障害競走、繋駕車を曳いて走る繋駕速歩競走の三つからなり、他に繋駕車を曳かない速歩競走やそりを曳くばんえい競走などがある。競走では一般には騎手が馬に騎乗して一定の距離を走り、最も早く決勝線に到達した馬を勝者とする。

用いられる競走馬は平地や障害、速歩競走ではサラブレッド、サラブレッド系種、アラブ、アングロアラブ、アラブ系種の軽種馬もしくはクォーターホース、スタンダードブレッド等の中間種が用いられ、ばんえい競走では重種馬が用いられる。

競馬の世界は優勝劣敗が大原則であり、強い馬は強い馬同士、弱い馬は弱い馬同士で競走するのが基本である。だが、競走の出走メンバーのみを変更するには限界がある。そこで考え出された方法として強い馬には重い負担重量を、弱い馬には軽い負担重量となるように負担重量を変更することである。負担重量の決定方法としては馬齢戦、別定戦、定量戦、ハンデキャップ競走などがある。

競馬の競走には大多数の一般競走と、賞金が高額で特別登録料が必要な特別競走が存在する。特別競走の中でも特に賞金が高額で歴史と伝統・競走内容等を考慮し、重要な意義を持つ競走として重賞が行われる。各重賞競走の役割と重要性を広く認識してもらい生産界の指標としての重賞競走の位置づけを明確にするため、グループ制によってG1、G2、G3に分類される。G1は競走体系上もっとも重要な意義をもつ根幹競走、G2はG1に次ぐ主要な競走でG1の勝ち馬も比較的容易に出走できる内容をもった競走である。G3についてはG1、G2以外の競走である。

G1競走の中でも、三歳馬に対して行われる伝統のある競走をクラシックと呼ぶ。世界各地でクラシックと呼ばれる競走が行われているが、多くの国がイギリスのクラシックレースを模範としている。イギリスのクラシックは全五競走で、うち二競走は牝馬限定戦であり、牡馬が出走可能な三競走すべてに優勝した競走馬を三冠馬という。ただし生産上の意味合いが薄れ、また距離別の路線が体系化されたこともあって三冠の概念は形骸化している。日本のクラシック競走はイギリスと同様に全五競走で、三歳牝馬路線の最終戦である秋華賞はクラシックには含まれていないが、三冠の概念は依然として重要視されている。".to_string(),

        ];
        let model_path = "chive-1.3-mc100-dim50.fifu";
        let n_clusters = 6;

        let result = process_and_cluster(texts, model_path, n_clusters);
        assert!(result.is_ok());
        println!("Result: {:?}", result);
    }
}
