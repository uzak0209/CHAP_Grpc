use tokenizers::Tokenizer;
use vibrato::{Dictionary, Tokenizer as VibratoTokenizer};
use std::fs::File;

fn main() -> anyhow::Result<()> {
    // Vibrato 辞書を読み込み（zstd圧縮ファイル）
    let dict_path = "dict/ipadic-mecab-2_7_0/system.dic.zst";
    let file = File::open(dict_path)?;
    let decoder = zstd::Decoder::new(file)?;
    let dict = Dictionary::read(decoder)?;
    let morpheme_tokenizer = VibratoTokenizer::new(dict);
    
    // WordPiece トークナイザーを読み込み
    let wordpiece_tokenizer = Tokenizer::from_file("cl-tohoku/bert-base-japanese-v3/tokenizer.json")
        .map_err(|e| anyhow::anyhow!("Failed to load tokenizer: {:?}", e))?;
    
    let text = "災害が起きて全ての建物は崩れ落ちた。";
    
    // ステップ1: 形態素解析
    let mut worker = morpheme_tokenizer.new_worker();
    worker.reset_sentence(text);
    worker.tokenize();
    
    let morphemes: Vec<String> = worker
        .token_iter()
        .map(|token| token.surface().to_string())
        .collect();
    
    println!("形態素解析結果: {:?}", morphemes);
    
    // ステップ2: WordPiece トークナイズ
    // 形態素間にスペースを入れて結合
    let joined_text = morphemes.join(" ");
    let output = wordpiece_tokenizer.encode(joined_text.as_str(), true)
        .map_err(|e| anyhow::anyhow!("Failed to encode: {:?}", e))?;
    
    println!("WordPiece トークン: {:?}", output.get_tokens());
    println!("トークンID: {:?}", output.get_ids());
    
    Ok(())
}