use crate::domain::domain_service::clustering;
use crate::domain::domain_service::get_trend::get_trend;
use crate::domain::domain_service::tokenizer::tokenizer;
use crate::domain::domain_service::word2vec::Word2VecModel;
use crate::infra::repository::{
    event_repository::EventRepository, post_repository::PostRepository,
    thread_repository::ThreadRepository,
};
use crate::presentation::handler::handler;
use crate::usecase::lang_analyzer::LangAnalyzerUsecase;
use sea_orm::Database;
#[tokio::test]
async fn test_lang_analyzer_integration() {
    let dsn = std::env::var("DSN").unwrap_or_else(|_| {
        "postgresql://postgres@localhost:5433/chapdb?sslmode=disable".to_string()
    });
    println!("Using DSN: {}", dsn);
    // connect using sea-orm
    let db = sea_orm::Database::connect(&dsn)
        .await
        .expect("DB connect failed");

    let postrepo = PostRepository::new(db.clone());
    let threadrepo = ThreadRepository::new(db.clone());
    let eventrepo = EventRepository::new(db.clone());
    let analyzer = LangAnalyzerUsecase::new(postrepo, threadrepo, eventrepo);

    // DBからテキスト取得
    let contents = analyzer.get_contents().await.expect("DB取得失敗");
    println!("DBから取得したテキスト件数: {}", contents.len());

    // トークナイズ
    let tokenized: Vec<Vec<String>> = contents
        .iter()
        .map(|text| tokenizer(text.clone()).unwrap_or_default())
        .collect();
    println!("トークナイズ後: {:?}", tokenized);

    // Word2Vecモデルロード
    let model_path = "chive-1.3-mc100-dim50.fifu";
    let model = Word2VecModel::load(model_path).expect("Word2Vecモデルロード失敗");

    // クラスタリング（flattenして単語リスト化）
    let words: Vec<String> = tokenized.into_iter().flatten().collect();
    let n_clusters = 6;
    let clustering_result =
        clustering::process_and_cluster(words, model_path, n_clusters).expect("クラスタリング失敗");
    println!("クラスタリング結果: {:?}", clustering_result);

    // トレンド抽出
    let trend = get_trend(clustering_result);
    println!("トレンド: {:?}", trend);
}
