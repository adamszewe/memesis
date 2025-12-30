terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }

  # backend "s3" {
  #   # Uncomment and configure for remote state
  #   bucket = "memesis-terraform-state"
  #   key    = "memesis/terraform.tfstate"
  #   region = "eu-west-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Memesis"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
