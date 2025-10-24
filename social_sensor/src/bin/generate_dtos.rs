use clap::Parser;

#[derive(Parser)]
struct Opts {
    #[arg(long)]
    database_url: Option<String>,

    #[arg(long, default_value = "src/domain/dto")]
    out_dir: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let opts = Opts::parse();
    let database_url = match opts.database_url {
        Some(d) => d,
        None => std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    };
    println!("Generating DTOs to {} from {}", opts.out_dir, database_url);
    social_sensor_invoke::generate(&database_url, &opts.out_dir).await?;
    println!("Done");
    Ok(())
}
