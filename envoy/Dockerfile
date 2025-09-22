FROM envoyproxy/envoy:v1.28-latest

# Envoy設定ファイルをコピー
COPY envoy.yaml /etc/envoy/envoy.yaml

# ポートを公開
EXPOSE 8080 9901

# Envoyを起動
CMD ["/usr/local/bin/envoy", "-c", "/etc/envoy/envoy.yaml"]