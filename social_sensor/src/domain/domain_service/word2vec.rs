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
        let f =
            File::open(path).with_context(|| format!("Failed to open word2vec model: {}", path))?;
        let mut reader = BufReader::new(f);
        let embeddings = Embeddings::read_embeddings(&mut reader)
            .with_context(|| "Failed to read embeddings")?;

        Ok(Self { embeddings })
    }

    /// 単語をベクトルに変換
    pub fn word_to_vec(&self, word: &str) -> Option<Vec<f32>> {
        let word = word.trim();
        if self.embeddings.vocab().idx(word).is_none() {
            println!("Not found in vocab: {}", word);
        }
        self.embeddings.embedding(word).map(|e| e.to_vec())
    }
    /// ベクトルの次元数を取得
    pub fn dims(&self) -> usize {
        self.embeddings.dims()
    }
}

#[cfg(test)]
mod tests {
    use crate::domain::domain_service::tokenizer::tokenizer;

    use super::*;

    #[test]

    fn test_word_to_vec() -> Result<(), anyhow::Error> {
        let model = Word2VecModel::load("chive-1.3-mc100-dim50.fifu").unwrap();
        let message =
            "東京は素晴らしい場所です。しかし、渋滞が多いです。しかし、食べ物は美味しい。競馬は、騎手が乗った馬により競われる競走競技であり、その着順を予想する賭博である。イギリスを発祥とする近代競馬は多くの国々で開催されており、その多くは勝馬投票券の販売とセットの興行として行われている。

競馬は主に競馬場と呼ばれる専用の競技場で開催される。一つ一つの競い合いを競走と呼び、一日の競馬開催でいくつかの競走が行われる。競走の種類は、平坦なコースを走る平地競走、障害物の飛越を伴う障害競走、繋駕車を曳いて走る繋駕速歩競走の三つからなり、他に繋駕車を曳かない速歩競走やそりを曳くばんえい競走などがある。競走では一般には騎手が馬に騎乗して一定の距離を走り、最も早く決勝線に到達した馬を勝者とする。

用いられる競走馬は平地や障害、速歩競走ではサラブレッド、サラブレッド系種、アラブ、アングロアラブ、アラブ系種の軽種馬もしくはクォーターホース、スタンダードブレッド等の中間種が用いられ、ばんえい競走では重種馬が用いられる。

競馬の世界は優勝劣敗が大原則であり、強い馬は強い馬同士、弱い馬は弱い馬同士で競走するのが基本である。だが、競走の出走メンバーのみを変更するには限界がある。そこで考え出された方法として強い馬には重い負担重量を、弱い馬には軽い負担重量となるように負担重量を変更することである。負担重量の決定方法としては馬齢戦、別定戦、定量戦、ハンデキャップ競走などがある。

競馬の競走には大多数の一般競走と、賞金が高額で特別登録料が必要な特別競走が存在する。特別競走の中でも特に賞金が高額で歴史と伝統・競走内容等を考慮し、重要な意義を持つ競走として重賞が行われる。各重賞競走の役割と重要性を広く認識してもらい生産界の指標としての重賞競走の位置づけを明確にするため、グループ制によってG1、G2、G3に分類される。G1は競走体系上もっとも重要な意義をもつ根幹競走、G2はG1に次ぐ主要な競走でG1の勝ち馬も比較的容易に出走できる内容をもった競走である。G3についてはG1、G2以外の競走である。

G1競走の中でも、三歳馬に対して行われる伝統のある競走をクラシックと呼ぶ。世界各地でクラシックと呼ばれる競走が行われているが、多くの国がイギリスのクラシックレースを模範としている。イギリスのクラシックは全五競走で、うち二競走は牝馬限定戦であり、牡馬が出走可能な三競走すべてに優勝した競走馬を三冠馬という。ただし生産上の意味合いが薄れ、また距離別の路線が体系化されたこともあって三冠の概念は形骸化している。日本のクラシック競走はイギリスと同様に全五競走で、三歳牝馬路線の最終戦である秋華賞はクラシックには含まれていないが、三冠の概念は依然として重要視されている。";
        let tokens = tokenizer(message.to_string())?;
        let v: Vec<Vec<f32>> = tokens
            .iter()
            .filter_map(|word| model.word_to_vec(word))
            .collect();

        Ok(())
    }
}
