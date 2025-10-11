resource "aws_acm_certificate" "api_cert" {
  domain_name       = "api.chap-app.jp"
  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "api_cert_validation" {
  certificate_arn = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [
    cloudflare_record.cert_validation.hostname
  ]
}

# Cloudflare側の検証用DNSレコード
resource "cloudflare_record" "cert_validation" {
  zone_id = cloudflare_zone.chap.id
  name    = tolist(aws_acm_certificate.api_cert.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.api_cert.domain_validation_options)[0].resource_record_type
  value   = tolist(aws_acm_certificate.api_cert.domain_validation_options)[0].resource_record_value
  ttl     = 300
}

resource "cloudflare_zone" "chap" {
  name = "chap-app.jp"
}

resource "aws_api_gateway_domain_name" "custom_domain" {
  domain_name = "api.chap-app.jp"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  regional_certificate_arn = aws_acm_certificate.api_cert.arn
}

resource "aws_api_gateway_base_path_mapping" "main" {
  domain_name = aws_api_gateway_domain_name.custom_domain.domain_name
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = aws_api_gateway_deployment.main.stage_name
}

