# Backend TypeScript Migration

`backend` は現在 `Go + gRPC + gRPC-Gateway` で動いています。段階的移行のため、同じディレクトリ配下に `Hono + TypeScript + Zod` の並走実装を追加しました。

## 今回追加したもの

- `src/index.ts`: Hono の起動エントリ
- `src/app.ts`: ルート集約
- `src/config/env.ts`: `Zod` による環境変数検証
- `src/domains/auth/*`: `auth` ドメインの最初の移植
- `src/domains/comment/*`: `comment` の `create/get/edit/delete` 移植
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

## TypeScript 置換済みの範囲

- 起動基盤: `src/index.ts`, `src/app.ts`
- 設定/共通: `src/config/env.ts`, `src/lib/db.ts`, `src/lib/jwt.ts`, `src/middleware/auth.ts`
- API まで移行済み: `auth`, `comment`
- infra 相当まで移行済み: `auth`, `comment`, `event`, `post`, `thread`, `spot`, `user`
- まだ Go が主実装: gRPC サーバー本体、handler 群、protobuf/gateway 連携

レスポンス形式は Go 実装の `AuthResponse` に寄せています。

## 起動

1. `backend/package.json` の依存をインストールする
2. `backend/.env` に `DB_DSN`, `JWT_SECRET`, `PORT` を設定する
3. `npm run dev` または `npm run start` を `backend` で実行する

## 次の移行順

1. `event`, `post`, `thread`, `spot`, `user` の順にドメイン単位で移行
2. `comment` の like 系テーブルも TS 側へ寄せる
3. `gRPC-Gateway` 依存を外せる段階で HTTP API を TS 側に一本化する

## 注意

- 現在の Go 実装は平文パスワード比較です。DB 互換性を優先して、TS 側も同じ挙動にしています
- テーブル名は GORM の既定命名 (`user_db_models`, `auth_db_models`) に合わせています
- `comment` の `edit/delete` は JWT の `userId` と `comment.user_id` が一致する本人だけ許可します
