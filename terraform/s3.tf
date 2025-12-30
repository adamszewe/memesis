# S3 Bucket for meme images
resource "aws_s3_bucket" "memes" {
  bucket = "${var.project_name}-memes-${var.environment}"

  tags = {
    Name = "${var.project_name}-memes-bucket"
  }
}

# Block all public access to the bucket
resource "aws_s3_bucket_public_access_block" "memes" {
  bucket = aws_s3_bucket.memes.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning (optional, but good practice)
resource "aws_s3_bucket_versioning" "memes" {
  bucket = aws_s3_bucket.memes.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "memes" {
  bucket = aws_s3_bucket.memes.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
