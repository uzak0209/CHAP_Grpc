# DTO 生成ツール

このプロジェクトには Postgres データベースのスキーマを読み取り、`src/domain/dto` に Rust の DTO 構造体を生成する簡易ジェネレータが含まれます。

使い方:

1. 環境変数 `DATABASE_URL` を設定するか、`--database-url` オプションで指定します。

例:

```bash
export DATABASE_URL=postgres://user:pass@localhost:5432/dbname
cargo run -p social_sensor --bin generate_dtos -- --out-dir src/domain/dto
```

または:

```bash
cargo run -p social_sensor --bin generate_dtos -- --database-url "$DATABASE_URL" --out-dir src/domain/dto
```

生成されるファイル:
- `src/domain/dto/mod.rs` と各テーブル毎の `{table}.rs` が出力されます。

注意:
- 現在は public スキーマのみを対象としています。
- 型マッピングは単純化されています。必要に応じて `src/infra/schema_generator.rs` の `map_pg_type_to_rust` を拡張してください。
