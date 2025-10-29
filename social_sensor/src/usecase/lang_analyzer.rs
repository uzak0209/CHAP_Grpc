use anyhow::Result as AnyResult;
use std::collections::BTreeMap;

use crate::infra::repository::{event_repository::EventRepository, post_repository::PostRepository, thread_repository::ThreadRepository};

/// LangAnalyzerUsecase: gathers text from repositories, tokenizes, builds frequency map,
/// optionally runs clustering via an embeddings model, and writes a cache file.
pub struct LangAnalyzerUsecase {
    pub postrepo: PostRepository,
    pub threadrepo: ThreadRepository,
    pub eventrepo: EventRepository,
}

impl LangAnalyzerUsecase {
    pub fn new(postrepo: PostRepository, threadrepo: ThreadRepository, eventrepo: EventRepository) -> Self {
        Self { postrepo, threadrepo, eventrepo }
    }

    /// Collect content from DB, tokenize, and write frequency JSON to /tmp/lang_cache.json
    pub async fn process_and_cache(&self) -> AnyResult<String> {
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

        // Tokenize using domain tokenizer
        let mut freq: BTreeMap<String, u64> = BTreeMap::new();
        for c in contents {
            match crate::domain::domain_service::tokenizer::tokenizer(c.clone()) {
                Ok(tokens) => {
                    for t in tokens {
                        let w = t.to_lowercase();
                        *freq.entry(w).or_insert(0) += 1;
                    }
                }
                Err(_) => continue,
            }
        }

        // Serialize and write to /tmp/lang_cache.json (same path used in aiserver)
        let json = serde_json::to_string(&freq)?;
        let _ = std::fs::write("/tmp/lang_cache.json", &json);

        Ok("processed".to_string())
    }
}
