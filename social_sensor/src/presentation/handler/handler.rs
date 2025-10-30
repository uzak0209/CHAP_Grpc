use crate::infra::repository::{
    event_repository::EventRepository, post_repository::PostRepository,
    thread_repository::ThreadRepository,
};
use crate::presentation::dto::coordinate::SimpleCoordinate;
use actix_web::{App, HttpResponse, HttpServer, web};
use serde_json::json;
use std::net::SocketAddr;
use std::sync::Arc;
#[derive(Clone)]
pub struct AppState {
    pub db: Arc<sea_orm::DatabaseConnection>,
}

async fn lang_process_actix(state: web::Data<AppState>) -> HttpResponse {
    // construct repositories from sea_orm connection
    let postrepo = PostRepository::new(state.db.as_ref().clone());
    let threadrepo = ThreadRepository::new(state.db.as_ref().clone());
    let eventrepo = EventRepository::new(state.db.as_ref().clone());

    let usecase =
        crate::usecase::lang_analyzer::LangAnalyzerUsecase::new(postrepo, threadrepo, eventrepo);
    match usecase.get_clustering_result().await {
        Ok(result) => {
            let data: Vec<SimpleCoordinate> =
                result.into_iter().map(SimpleCoordinate::from).collect();
            let resp = { data };
            HttpResponse::Ok().json(resp)
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "data": [],
            "ok": false
        }))
    }
}

async fn lang_cache_actix() -> HttpResponse {
    match std::fs::read_to_string("/tmp/lang_cache.json") {
        Ok(s) => HttpResponse::Ok().content_type("application/json").body(s),
        Err(_) => HttpResponse::NotFound().body("cache not found"),
    }
}

/// Start an actix-web server that supports GET /called_ai
pub async fn serve(addr: SocketAddr, state: AppState) -> anyhow::Result<()> {
    let state_data = web::Data::new(state);
    HttpServer::new(move || {
        App::new()
            .app_data(state_data.clone())
            .route("/lang/process", web::get().to(lang_process_actix))
            .route("/lang/cache", web::get().to(lang_cache_actix))
    })
    .bind(addr)?
    .run()
    .await
    .map_err(|e| anyhow::anyhow!(e.to_string()))?;
    Ok(())
}
