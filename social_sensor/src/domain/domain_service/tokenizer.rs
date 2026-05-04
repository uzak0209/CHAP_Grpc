use once_cell::sync::Lazy;
use std::fs::File;
use std::sync::Arc;
use vibrato::{Dictionary, Tokenizer as VibratoTokenizer};

static TOKENIZER: Lazy<Arc<VibratoTokenizer>> = Lazy::new(|| {
    let file = File::open("system.dic.zst").expect("Failed to open dictionary file");
    let decoder = zstd::Decoder::new(file).expect("Failed to decode zstd");
    let dict = Dictionary::read(decoder).expect("Failed to read dictionary");
    Arc::new(VibratoTokenizer::new(dict))
});

const STOPWORDS: &[&str] = &[
    "する", "れる", "られる", "と", "か", "いる", "ある", "なる", "できる",
    "得る", "行う", "こと", "もの", "よう", "ため", "が", "は",
];

pub fn tokenizer(text: String) -> anyhow::Result<Vec<String>> {
    let tokenizer = TOKENIZER.clone();
    let mut worker = tokenizer.new_worker();
    worker.reset_sentence(text);
    worker.tokenize();

    let morphemes: Vec<String> = worker
        .token_iter()
        .filter_map(|token| {
            let surface = token.surface().to_string();
            let feat = token.feature();
            let mut fields = feat.split(',');
            let pos = fields.next().unwrap_or("").to_string();
            let pos1 = fields.next().unwrap_or("").to_string();
            let base = feat.split(',').nth(6).unwrap_or("");
            let token = if base != "*" { base } else { surface.as_str() }.to_string();
            Some((token, pos, pos1))
        })
        .filter(|(_, pos, _)| matches!(pos.as_str(), "名詞" | "動詞" | "形容詞"))
        .filter(|(_, pos, pos1)| {
            !(pos == "名詞"
                && matches!(
                    pos1.as_str(),
                    "数" | "非自立" | "代名詞" | "副詞可能" | "接尾"
                ))
        })
        .filter(|(token, _, _)| !token.chars().all(|c| c.is_ascii_digit()))
        .filter(|(token, pos, pos1)| {
            let len = token.chars().count();
            let proper = pos == "名詞" && pos1 == "固有名詞";
            len > 1 || proper
        })
        .filter(|(token, _, _)| !STOPWORDS.contains(&token.as_str()))
        .map(|(token, _, _)| token)
        .collect();

    Ok(morphemes)
}
