variable "db_password" {
  type        = string
  default     = "Skakki0209"
  description = "description"
}
variable "public_key_path" {
  type        = string
  default     = ""
  description = "Path to the public key file. If empty, a new key pair will be generated."
}
variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare Account ID for DNS validation"
  default     = "e3800962ed5e416e565f49c823868cf3"
}
variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token with DNS edit permissions"
  default     = "dfdBnRrTVOKzCqbGYX3JdA0mMfgLeNX5I8D-RXSh"
  sensitive   = true
}