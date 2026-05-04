use reqwest::Client;
use serde_json::json;

pub async fn ask_trend_gemini(trends: Vec<String>) -> Result<String, Box<dyn std::error::Error>> {
    let api_key = std::env::var("GEMINI_API_KEY")?;
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

let prompt = format!( "これから示す文字列の共通していることを抽出してください。
尚回答の際は日本語で、尚且つ一文のみで回答してください。
「はいわかりました」などの文言は不要です。
例1[猫、犬、ハムスター]回答例:ペット
例2[リンゴ、バナナ、オレンジ]回答例:果物例

3[サッカー、野球、バスケットボール]回答例:スポーツ
それでは下記の文字列について共通していることを抽出し一言のみで答えてください。\n{:?}", trends );
    let body = json!({
        "model": "gemini-2.5-flash",  // またはあなたが使えるモデル名
        "contents": [
            {
                "role": "user",
                "parts": [
                    { "text": prompt }
                ]
            }
        ]
    });

    let client = Client::new();
    let res = client
        .post(&url)
        .json(&body)
        .send()
        .await?
        .json::<serde_json::Value>()
        .await?;

    println!("{}", res); // レスポンス全体を確認

    // 生成テキストを取り出す
    // v1beta では res["output"][0]["content"][0]["text"] に入る場合が多い
    let answer = res["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or("No answer")
        .to_string();

    Ok(answer)
}
