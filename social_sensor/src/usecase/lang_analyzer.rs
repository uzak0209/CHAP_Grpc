use crate::domain::composite::coordinate::Coordinate;
use crate::domain::domain_service::heatmap;
use crate::domain::domain_service::{clustering, get_trend::get_trend};
use crate::infra::repository::gemini;
use crate::{
    domain::domain_service::tokenizer::tokenizer,
    infra::repository::{
        event_repository::EventRepository, post_repository::PostRepository,
        thread_repository::ThreadRepository,
    },
};
pub struct ClusteringResponse{
    pub trend: Vec<Coordinate>,
    pub gemini_response: String,
}
use anyhow::Result as AnyResult;
/// LangAnalyzerUsecase: gathers text from repositories, tokenizes, builds frequency map,
/// optionally runs clustering via an embeddings model, and writes a cache file.
pub struct LangAnalyzerUsecase {
    pub postrepo: PostRepository,
    pub threadrepo: ThreadRepository,
    pub eventrepo: EventRepository,
}

impl LangAnalyzerUsecase {
    pub fn new(
        postrepo: PostRepository,
        threadrepo: ThreadRepository,
        eventrepo: EventRepository,
    ) -> Self {
        Self {
            postrepo,
            threadrepo,
            eventrepo,
        }
    }

    /// Collect content from DB, tokenize, and write frequency JSON to /tmp/lang_cache.json
    pub async fn get_contents(&self) -> AnyResult<Vec<String>> {
        let mut contents: Vec<String> = Vec::new();

        let posts = self.postrepo.find_valid_post_entities().await?;
        for p in posts {
            contents.push(p.content().to_string());
        }

        let threads = self.threadrepo.find_valid_thread_entities().await?;
        for t in threads {
            // use title as textual content for threads
            contents.push(t.title().to_string());
        }

        let events = self.eventrepo.find_valid_event_entities().await?;
        for e in events {
            contents.push(e.title().to_string());
        }

        Ok(contents)
    }

    fn tokenize(contents: Vec<String>) -> anyhow::Result<Vec<String>> {
        // Tokenize each input string and flatten into a single vector of tokens.
        let joined = contents.join(" ");
        let tokenized = tokenizer(joined)?;
        Ok(tokenized)
    }

    /// Use case for clustering data
    fn execute_clustering(
        tokenized_data: Vec<String>,
        model_path: &str,
        n_clusters: usize,
    ) -> anyhow::Result<Vec<String>> {
        let clustering_result =
            clustering::process_and_cluster(tokenized_data, model_path, n_clusters)?;
        let trend = get_trend(clustering_result);
        return Ok(trend);
    }

    pub async fn get_clustering_result(&self) -> anyhow::Result<ClusteringResponse> {
        let contents = self.get_contents().await?;
        println!("Fetched {:?} contents from repositories.", contents);
        let tokenized_data = Self::tokenize(contents)?;
        let model_path = "chive-1.3-mc100-dim50.fifu"; // specify your model path
        let n_clusters = std::cmp::max(1, tokenized_data.len() / 100); // ensure at least 1 cluster
        let clustering_result = Self::execute_clustering(tokenized_data, model_path, n_clusters)?;
        let gemini_response = gemini::ask_trend_gemini(clustering_result.clone())
            .await.map_err(|e| anyhow::anyhow!(e.to_string()))?;
        let result = heatmap::map_clustering_result(
            &self.postrepo,
            &self.eventrepo,
            &self.threadrepo,
            clustering_result,
        )
        .await?;
        println!("Clustering and mapping completed. Result: {:?}", result);

        Ok(ClusteringResponse {
            trend: result,
            gemini_response: gemini_response,
        })
    }
}
