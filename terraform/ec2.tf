resource "aws_key_pair" "my_key" {
  key_name   = "my-key"
  public_key = local.public_key_content
}

resource "aws_security_group" "allow_http" {
  name        = "allow_ssh_http"
  description = "Allow SSH and HTTP inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # HTTPアクセス
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # 全送信許可
  }
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"

  key_name              = aws_key_pair.my_key.key_name
  vpc_security_group_ids = [aws_security_group.allow_http.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  tags = {
    Name = "API-EC2"
  }
  subnet_id = aws_subnet.public.id
}

resource "tls_private_key" "generated" {
  count     = var.public_key_path == "" || !fileexists(var.public_key_path) ? 1 : 0
  algorithm = "RSA"
  rsa_bits  = 4096
}

locals {
  public_key_content = (var.public_key_path != "" && fileexists(var.public_key_path)) ? file(var.public_key_path) : (length(tls_private_key.generated) > 0 ? tls_private_key.generated[0].public_key_openssh : "")
}

resource "local_file" "generated_private_key" {
  count           = var.public_key_path == "" || !fileexists(var.public_key_path) ? 1 : 0
  content         = tls_private_key.generated[0].private_key_pem
  filename        = "${path.root}/generated_chap_key.pem"
  file_permission = "0600"
}

