#!/usr/bin/env python3
"""Fetch content from Postgres and produce a token frequency cache at /tmp/lang_cache.json.

Usage:
  - Provide RDS_DSN env var (e.g. "host=127.0.0.1 port=5433 dbname=chapdb user=postgres") to use local psql.
  - Otherwise the script will run `docker exec chap_postgres psql ...` to fetch data from the postgres container.
"""
import os
import re
import json
import shlex
import subprocess
import sys

SQL = "SELECT content FROM events UNION ALL SELECT content FROM threads UNION ALL SELECT content FROM posts;"

def run_psql_via_docker(sql: str) -> str:
    cmd = ["docker", "exec", "-i", "chap_postgres", "psql", "-U", "postgres", "-d", "chapdb", "-At", "-c", sql]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        print("psql (docker) failed:\n", proc.stderr, file=sys.stderr)
        sys.exit(1)
    return proc.stdout

def run_psql_with_dsn(dsn: str, sql: str) -> str:
    # Use local psql with -d connection string
    cmd = ["psql", "-d", dsn, "-At", "-c", sql]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        print("psql failed:\n", proc.stderr, file=sys.stderr)
        sys.exit(1)
    return proc.stdout

def tokenize(text: str):
    # Matches ASCII words and common Japanese character ranges
    pattern = re.compile(r"[A-Za-z0-9]+|[一-龥ぁ-んァ-ヶ]+", flags=re.UNICODE)
    return pattern.findall(text)

def main():
    dsn = os.environ.get("RDS_DSN")
    if dsn:
        out = run_psql_with_dsn(dsn, SQL)
    else:
        # fallback to docker exec into chap_postgres
        out = run_psql_via_docker(SQL)

    freq = {}
    rows = out.splitlines()
    for row in rows:
        if not row:
            continue
        toks = tokenize(row)
        for t in toks:
            key = t.lower() if any('a' <= ch.lower() <= 'z' for ch in t if ch.isalpha()) else t
            freq[key] = freq.get(key, 0) + 1

    cache_path = "/tmp/lang_cache.json"
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(freq, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(freq)} tokens to {cache_path}")
    # print top 30
    top = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:30]
    for k, v in top:
        print(f"{k}: {v}")

if __name__ == '__main__':
    main()
