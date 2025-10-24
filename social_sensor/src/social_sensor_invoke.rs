pub async fn generate(database_url: &str, out_dir: &str) -> anyhow::Result<()> {
    crate::infra::schema_generator::generate_dtos(database_url, out_dir).await?;
    Ok(())
}
