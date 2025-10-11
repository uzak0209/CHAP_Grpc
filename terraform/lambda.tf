resource "aws_lambda_function" "image_compress" {
  filename      = "${path.module}/../lambda/chap_image_lambda.zip"
  function_name = "chap-image-compress"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "bootstrap"
  runtime       = "provided.al2"
  source_code_hash = filebase64sha256("${path.module}/../lambda/chap_image_lambda.zip")
  publish = true
  memory_size = 256
  timeout = 30
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_compress.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*"
}

