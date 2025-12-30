output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "EC2 instance public IP (Elastic IP)"
  value       = aws_eip.app.public_ip
}

output "ec2_private_ip" {
  description = "EC2 instance private IP"
  value       = aws_instance.app.private_ip
}

output "application_url" {
  description = "Application URL"
  value       = "http://${aws_eip.app.public_ip}:${var.app_port}"
}

output "ssh_command" {
  description = "SSH command to connect to EC2 instance"
  value       = var.key_name != "" ? "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.app.public_ip}" : "Use AWS Systems Manager Session Manager to connect"
}

output "next_steps" {
  description = "Next steps after deployment"
  value       = <<-EOT
    Docker and Docker Compose are pre-installed on the instance.

    1. SSH into the instance: ${var.key_name != "" ? "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.app.public_ip}" : "Use AWS Systems Manager Session Manager"}
    2. Navigate to /opt/memesis: cd /opt/memesis
    3. Clone your repository: git clone <your-repo-url> .
    4. Start services with Docker Compose: docker-compose up -d
    5. Access the application at: http://${aws_eip.app.public_ip}:${var.app_port}
  EOT
}

# Route53 Outputs
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route53 hosted zone name servers"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : []
}

output "domain_url" {
  description = "Domain URL"
  value       = var.domain_name != "" ? "http://${var.domain_name}" : null
}

output "memes_subdomain_url" {
  description = "Memes subdomain URL"
  value       = var.domain_name != "" ? "http://memes.${var.domain_name}" : null
}

# ECR Outputs
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.app.name
}

# CI/CD Outputs - IAM User Method
output "ci_user_name" {
  description = "IAM user name for CI/CD (if created)"
  value       = var.create_ci_user ? aws_iam_user.github_ci[0].name : null
}

output "ci_user_access_key_id" {
  description = "Access key ID for CI/CD user (if created)"
  value       = var.create_ci_user ? aws_iam_access_key.github_ci[0].id : null
  sensitive   = true
}

output "ci_user_secret_access_key" {
  description = "Secret access key for CI/CD user (if created)"
  value       = var.create_ci_user ? aws_iam_access_key.github_ci[0].secret : null
  sensitive   = true
}

# CI/CD Outputs - OIDC Method
output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions IAM role (if OIDC enabled)"
  value       = var.enable_github_oidc ? aws_iam_role.github_actions[0].arn : null
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider (if enabled)"
  value       = var.enable_github_oidc ? aws_iam_openid_connect_provider.github[0].arn : null
}
