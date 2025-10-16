mod tokenizer;
mod wordtovec;

use wordtovec::Word2VecModel;

fn main() -> anyhow::Result<()> {
    // Word2Vec モデルを読み込む
    println!("chiVe モデルを読み込み中...");
    let model = Word2VecModel::load("chive-1.3-mc90.fifu")?;
    println!("モデル読み込み完了！");
    println!("ベクトル次元数: {}", model.dims());
    println!();

    // テキストをトークナイズ
    let text = "ナリタブライアン（Narita Brian、1991年5月3日 - 1998年9月27日）は日本の競走馬・種牡馬。中央競馬史上5頭目のクラシック三冠馬。「シャドーロールの怪物」と呼ばれた。

1993年8月にデビュー。同年11月から1995年3月にかけてクラシック三冠を含むGI5連勝、10連続連対を達成し、1993年JRA賞最優秀3歳牡馬、1994年JRA賞年度代表馬及び最優秀4歳牡馬に選出された。1995年春に故障（股関節炎）を発症した後はその後遺症から低迷し、6戦して重賞を1勝するにとどまった（GI は5戦して未勝利）が、第44回阪神大賞典におけるマヤノトップガンとのマッチレースや短距離戦である第26回高松宮杯への出走によってファンの話題を集めた。…… 

".to_string();
    let tokens = tokenizer::tokenizer(text.clone())?;
    println!("入力テキスト: {}", text);
    println!("トークン: {}", tokens.join(" "));
    println!();

    // トークン間の類似度行列を計算
    println!("=== トークン間のコサイン類似度行列 ===");
    let similarity_matrix = model.similarity_matrix(&tokens);
    for row in &similarity_matrix {
        for (word1, word2, similarity) in row {
            println!("'{}' と '{}': {:.4}", word1, word2, similarity);
        }
    }
    println!();

    // 階層的クラスタリング
    println!("=== 階層的クラスタリング（しきい値: 0.5）===");
    let clusters = model.hierarchical_clustering(&tokens, 0.5);
    for (i, cluster) in clusters.iter().enumerate() {
        println!("クラスタ {}: [{}]", i + 1, cluster.join(", "));
    }
    println!();

    // より低いしきい値でクラスタリング
    println!("=== 階層的クラスタリング（しきい値: 0.3）===");
    let clusters_strict = model.hierarchical_clustering(&tokens, 0.3);
    for (i, cluster) in clusters_strict.iter().enumerate() {
        println!("クラスタ {}: [{}]", i + 1, cluster.join(", "));
    }

    Ok(())
}
