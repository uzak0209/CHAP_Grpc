resource "aws_db_instance" "app_db" {
  identifier             = "chap-app-db"
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "chapdb"
  username               = "uzak"
  password               = var.db_password
  publicly_accessible    = false
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}

resource "aws_db_subnet_group" "main" {
  # include workspace to reduce chance of name collision with existing groups
  name       = "rds-private-${terraform.workspace}"
  subnet_ids = [aws_subnet.private.id, aws_subnet.private_b.id]
}