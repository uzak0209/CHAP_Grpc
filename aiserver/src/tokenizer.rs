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
    
    // 簡易ストップワード（要求ベース）
    const STOPWORDS: &[&str] = &[
        // 助動・補助・機能語・一般的な語
        "する", "れる", "られる", "と", "か",
        "いる", "ある", "なる", "できる", "得る", "行う",
        "こと", "もの", "よう", "ため"
    ];

    let morphemes: Vec<String> = worker
        .token_iter()
        .filter_map(|token| {
            let surface = token.surface();
            let feat = token.feature(); // IPADIC: 品詞,品詞細分類1,品詞細分類2,品詞細分類3,活用型,活用形,基本形,読み,発音
            let mut fields = feat.split(',');
            let pos = fields.next().unwrap_or("");
            let pos1 = fields.next().unwrap_or("");
            let _pos2 = fields.next().unwrap_or("");
            let _pos3 = fields.next().unwrap_or("");
            let _ctype = fields.next().unwrap_or("");
            let _cform = fields.next().unwrap_or("");
            // 基本形は7番目（0始まりでindex 6）
            let base = feat.split(',').nth(6).unwrap_or("");

            // 内容語のみ採用（名詞・動詞・形容詞）
            let is_content = pos == "名詞" || pos == "動詞" || pos == "形容詞";
            if !is_content {
                return None;
            }

            // 名詞のうち非内容カテゴリは除外
            if pos == "名詞" {
                if matches!(pos1, "数" | "非自立" | "代名詞" | "副詞可能" | "接尾") {
                    return None;
                }
            }

            // 基本形があればそれを、なければ表層
            let token_str = if !base.is_empty() && base != "*" { base } else { surface };

            // 数字だけのトークンは除外
            if token_str.chars().all(|c| c.is_ascii_digit()) { return None; }

            // 1文字の記号や空文字は除外（ただし固有名詞は許可）
            let char_len = token_str.chars().count();
            let is_proper_noun = pos == "名詞" && pos1 == "固有名詞";
            if char_len <= 1 && !is_proper_noun { return None; }

            // ストップワード除外（基本形ベース）
            if STOPWORDS.contains(&token_str) { return None; }

            Some(token_str.to_string())
        })
        .collect();
    
    return Ok(morphemes);
}