# Backend TypeScript Migration

`backend` は現在 `Go + gRPC + gRPC-Gateway` で動いています。段階的移行のため、同じディレクトリ配下に `Hono + TypeScript + Zod` の並走実装を追加しました。

## 今回追加したもの

- `src/index.ts`: Hono の起動エントリ
- `src/app.ts`: ルート集約
- `src/config/env.ts`: `Zod` による環境変数検証
- `src/domains/auth/*`: `auth` ドメインの最初の移植
- `src/domains/comment/*`: `comment` の `create/get/edit/delete` 移植
- `src/domains/image/*`: 画像アップロード用の署名付き URL 発行
- `src/domains/event|post|thread|spot|user/*.repository.ts`: Go `infra/repository` 相当の先行移植
- `src/middleware/auth.ts`: Bearer JWT 認証
- `src/lib/*`: Postgres 接続と JWT 発行

## 対応済み API

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/signin`
- `GET /api/v1/comments/:threadId`
- `POST /api/v1/comments/create`
- `PUT /api/v1/comments/edit`
- `DELETE /api/v1/comments/delete/:commentId`
- `GET /health`
- `POST /api/v1/images/upload`

## TypeScript 置換済みの範囲

- 起動基盤: `src/index.ts`, `src/app.ts`
- 設定/共通: `src/config/env.ts`, `src/lib/db.ts`, `src/lib/jwt.ts`, `src/middleware/auth.ts`
- API まで移行済み: `auth`, `comment`, `event`, `post`, `thread`, `spot`, `user`, `image`
- 残存する Go 資産: protobuf 生成物や旧 gRPC 実装コードの一部

レスポンス形式は Go 実装の `AuthResponse` に寄せています。

## 起動

1. `backend/package.json` の依存をインストールする
2. `backend/.env` に `DB_DSN`, `JWT_SECRET`, `PORT` を設定する
   ローカルで `npm run dev` を実行する場合、Postgres は `localhost:5433`、HTTP は `localhost:8083` を使う
   Docker Compose の `backend-server` からは `docker-compose*.yml` 側で `postgres:5432` と `PORT=8081` に上書きしている
3. `npm run dev` または `npm run start` を `backend` で実行する

## 次の移行順

1. `comment` の like 系テーブルも TS 側へ寄せる
2. 旧 gRPC/protobuf 資産を整理して完全な TS 構成へ寄せる

## 注意

- 現在の Go 実装は平文パスワード比較です。DB 互換性を優先して、TS 側も同じ挙動にしています
- テーブル名は GORM の既定命名 (`user_db_models`, `auth_db_models`) に合わせています
- `comment` の `edit/delete` は JWT の `userId` と `comment.user_id` が一致する本人だけ許可します
