# Backend TypeScript Migration

`backend` は現在 `Go + gRPC + gRPC-Gateway` で動いています。段階的移行のため、同じディレクトリ配下に `Hono + TypeScript + Zod` の並走実装を追加しました。

## 今回追加したもの

- `src/index.ts`: Hono の起動エントリ
- `src/app.ts`: ルート集約
- `src/config/env.ts`: `Zod` による環境変数検証
- `src/domains/auth/*`: `auth` ドメインの最初の移植
- `src/lib/*`: Postgres 接続と JWT 発行

## 対応済み API

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/signin`
- `GET /health`

レスポンス形式は Go 実装の `AuthResponse` に寄せています。

## 起動

1. `backend/package.json` の依存をインストールする
2. `backend/.env` に `DB_DSN`, `JWT_SECRET`, `PORT` を設定する
3. `npm run dev` または `npm run start` を `backend` で実行する

## 次の移行順

1. `middleware/auth.go` 相当の Bearer 認証ミドルウェアを `Hono` 側へ追加
2. `comment` を移植して、`Zod` 入力検証と UUID パースを TS 側へ集約
3. `event`, `post`, `thread`, `spot`, `user` の順にドメイン単位で移行

## 注意

- 現在の Go 実装は平文パスワード比較です。DB 互換性を優先して、TS 側も同じ挙動にしています
- テーブル名は GORM の既定命名 (`user_db_models`, `auth_db_models`) に合わせています
