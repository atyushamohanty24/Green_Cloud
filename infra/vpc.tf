resource "aws_vpc" "greencloud_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "greencloud-vpc"
    Environment = var.environment
    ManagedBy   = "GreenCloud-AI"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.greencloud_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "greencloud-public-a"
  }
}
