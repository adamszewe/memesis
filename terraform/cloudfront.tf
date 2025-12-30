# CloudFront Origin Access Control (recommended over OAI)
resource "aws_cloudfront_origin_access_control" "memes" {
  name                              = "${var.project_name}-memes-oac"
  description                       = "OAC for ${var.project_name} memes bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "memes" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} memes CDN"
  default_root_object = ""
  price_class         = "PriceClass_100" # Use only North America and Europe edge locations

  origin {
    domain_name              = aws_s3_bucket.memes.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.memes.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.memes.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.memes.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000 # 1 year (images are immutable or use unique filenames)
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-memes-cdn"
  }
}

# S3 bucket policy to allow CloudFront to read objects
resource "aws_s3_bucket_policy" "memes_cloudfront" {
  bucket = aws_s3_bucket.memes.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.memes.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.memes.arn
          }
        }
      }
    ]
  })
}
