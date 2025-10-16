use vibrato::{Dictionary, Tokenizer as VibratoTokenizer};
use std::fs::File;

pub fn tokenizer(text: String) -> anyhow::Result<Vec<String>> {
    // Vibrato 辞書を読み込み（zstd圧縮ファイル）
    let dict_path = "dict/ipadic-mecab-2_7_0/system.dic.zst";
    let file = File::open(dict_path)?;
    let decoder = zstd::Decoder::new(file)?;
    let dict = Dictionary::read(decoder)?;
    let morpheme_tokenizer = VibratoTokenizer::new(dict);
    // ステップ1: 形態素解析
    let mut worker = morpheme_tokenizer.new_worker();
    worker.reset_sentence(text);
    worker.tokenize();
    
    let morphemes: Vec<String> = worker
        .token_iter()
        .map(|token| token.surface().to_string())
        .collect();
    
    return Ok(morphemes);
}