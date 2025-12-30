# Memesis AWS Infrastructure

This Terraform configuration deploys the Memesis application on AWS with the following components:

## Infrastructure Components

- **VPC**: Custom VPC with public subnets across 2 availability zones
- **EC2**: t3.small instance (2 vCPU, 2 GiB RAM) running Ubuntu 24.04 LTS
- **Docker & Docker Compose**: Pre-installed for containerized deployment
- **Security Groups**: Configured for web traffic (HTTP/HTTPS), SSH access, and ICMP pings
- **Elastic IP**: Static IP address for the application
- **IAM Roles**: EC2 instance profile with SSM and CloudWatch access
- **Route53**: Hosted zone with DNS records for domain and memes subdomain (optional)

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Terraform** >= 1.0 installed
4. **SSH Key Pair** created in AWS EC2 console (optional but recommended)

## Quick Start

### 1. Configure Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and update:
- `aws_region`: Set to "eu-west-1" (Ireland) by default
- `key_name`: Your AWS EC2 key pair name
- `allowed_ssh_cidr_blocks`: Your IP address for SSH access
- `domain_name`: (Optional) Your domain name for Route53 setup
- Other variables as needed

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Review the Plan

```bash
terraform plan
```

### 4. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. Deployment takes approximately 10-15 minutes.

### 5. Get Outputs

```bash
terraform output
```

Save the following outputs:
- `ec2_public_ip`: Your server's public IP
- `application_url`: Where your app will be accessible
- `ssh_command`: Command to SSH into the instance

## Deploying the Application

After infrastructure is provisioned:

### 1. SSH into EC2 Instance

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@<ec2_public_ip>
```

Or use AWS Systems Manager Session Manager (no key required):
```bash
aws ssm start-session --target <instance-id>
```

### 2. Clone Your Repository

```bash
cd /opt/memesis
git clone https://github.com/yourusername/memesis.git .
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start all services defined in your `docker-compose.yml`:
- PostgreSQL database
- Go backend application
- Any other services

### 4. Check Service Status

```bash
docker-compose ps
docker-compose logs -f
```

### 5. Access Your Application

Open your browser to: `http://<ec2_public_ip>:8080`

## Route53 DNS Configuration (Optional)

If you configured a `domain_name` in your `terraform.tfvars`, Terraform will create a Route53 hosted zone and DNS records:

### 1. Get Name Servers

After deployment, get the Route53 name servers:

```bash
terraform output route53_name_servers
```

### 2. Update Domain Registrar

Update your domain registrar's DNS settings with the Route53 name servers from the output.

### 3. Wait for DNS Propagation

DNS propagation can take up to 48 hours, but usually completes within a few hours. You can check propagation status:

```bash
dig example.com
dig memes.example.com
```

### 4. Access via Domain

Once DNS propagates:
- Main domain: `http://example.com`
- Memes subdomain: `http://memes.example.com`

Both point to the same Elastic IP address.

## ECR (Elastic Container Registry) & CI/CD

The infrastructure includes AWS ECR for storing Docker images and supports two authentication methods for GitHub Actions.

### ECR Repository

After deployment, you'll have an ECR repository for your application:

```bash
terraform output ecr_repository_url
# Output: 123456789012.dkr.ecr.eu-west-1.amazonaws.com/memesis-app
```

### CI/CD Authentication Options

#### Option 1: OIDC (Recommended) ✅

OIDC (OpenID Connect) provides secure, temporary credentials without managing access keys.

**Setup Steps:**

1. **Enable in terraform.tfvars**:
   ```hcl
   enable_github_oidc = true
   github_repository  = "yourusername/memesis"
   ```

2. **Deploy infrastructure**:
   ```bash
   terraform apply
   ```

3. **Get the Role ARN**:
   ```bash
   terraform output github_actions_role_arn
   # Output: arn:aws:iam::123456789012:role/memesis-github-actions-role
   ```

4. **Add GitHub Secrets**:
   Go to your GitHub repository → Settings → Secrets and variables → Actions:
   - `AWS_ROLE_ARN`: The role ARN from step 3
   - `ECR_REPOSITORY`: `memesis-app` (from `terraform output ecr_repository_name`)

5. **Create workflow file**:
   Copy `.github/workflows/deploy.yml.example` to `.github/workflows/deploy.yml`:
   ```bash
   cp .github/workflows/deploy.yml.example .github/workflows/deploy.yml
   ```

6. **Push to trigger**:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add CI/CD workflow"
   git push
   ```

**Benefits of OIDC:**
- ✅ No long-lived credentials
- ✅ Automatic credential rotation
- ✅ Better security posture
- ✅ Scoped to specific repository

#### Option 2: IAM User with Access Keys (Not Recommended) ⚠️

Only use this method if OIDC is not available in your environment.

**Setup Steps:**

1. **Enable in terraform.tfvars**:
   ```hcl
   enable_github_oidc = false
   create_ci_user     = true
   ```

2. **Deploy infrastructure**:
   ```bash
   terraform apply
   ```

3. **Get credentials** (sensitive):
   ```bash
   terraform output ci_user_access_key_id
   terraform output -raw ci_user_secret_access_key
   ```

4. **Add GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`: From step 3
   - `AWS_SECRET_ACCESS_KEY`: From step 3
   - `ECR_REPOSITORY`: From `terraform output ecr_repository_name`

**Drawbacks:**
- ⚠️ Long-lived credentials
- ⚠️ Manual rotation required
- ⚠️ Harder to audit
- ⚠️ Higher security risk if leaked

### Pulling Images on EC2

The EC2 instance is pre-configured to pull images from ECR:

```bash
# SSH into instance
ssh -i ~/.ssh/your-key.pem ubuntu@<ec2_public_ip>

# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin <ecr_repository_url>

# Pull image
docker pull <ecr_repository_url>:latest

# Run container
docker run -d -p 8080:8080 <ecr_repository_url>:latest
```

### Local Development with ECR

To push images from your local machine:

```bash
# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url)

# Build image
docker build -t memesis-app .

# Tag image
docker tag memesis-app:latest $(terraform output -raw ecr_repository_url):latest

# Push image
docker push $(terraform output -raw ecr_repository_url):latest
```

## Configuration Files

- `provider.tf`: AWS provider and Terraform configuration
- `variables.tf`: Input variables with defaults
- `vpc.tf`: VPC, subnets, internet gateway, route tables
- `security_groups.tf`: EC2 security group with HTTP, HTTPS, SSH, and ICMP
- `ec2.tf`: EC2 instance with Docker and Docker Compose installation (Ubuntu 24.04 LTS)
- `ecr.tf`: ECR repository with lifecycle policy
- `iam_ci.tf`: IAM resources for CI/CD (OIDC provider and IAM user)
- `route53.tf`: Route53 hosted zone and DNS records (optional)
- `outputs.tf`: Output values after deployment

## Cost Estimation

Approximate monthly costs (eu-west-1):
- EC2 t3.small: ~$16/month
- EBS Storage (20GB): ~$2/month
- Elastic IP: ~$3.60/month (free when associated with running instance)
- Route53 Hosted Zone: ~$0.50/month (if domain configured)
- ECR Storage: ~$0.10/GB/month (first 10 images kept via lifecycle policy)
- Data Transfer: Variable
- **Total: ~$20-30/month**

Note: All services run in Docker containers on a single EC2 instance. Perfect for early-stage projects!

## Security Considerations

1. **SSH Access**: Restrict `allowed_ssh_cidr_blocks` to your IP
2. **Database Credentials**: Configure database passwords in your Docker Compose `.env` file
3. **HTTPS**: This configuration uses HTTP - add SSL certificate for production
4. **Container Security**: Only expose necessary ports in your `docker-compose.yml`
5. **Backups**: Set up automated backups for Docker volumes (database data)

## Customization

### Change Instance Size

In `terraform.tfvars`:
```hcl
instance_type = "t3.medium"  # 2 vCPU, 4 GiB RAM
root_volume_size = 30         # Increase storage if needed
```

### Enable Remote State (Recommended)

Edit `provider.tf` and uncomment the S3 backend:

```hcl
backend "s3" {
  bucket = "memesis-terraform-state"
  key    = "memesis/terraform.tfstate"
  region = "eu-west-1"
}
```

Create the S3 bucket first:
```bash
aws s3 mb s3://memesis-terraform-state
aws s3api put-bucket-versioning --bucket memesis-terraform-state --versioning-configuration Status=Enabled
```

## Monitoring

The EC2 instance has CloudWatch Agent installed. To set up detailed monitoring:

1. Configure CloudWatch Agent on the instance
2. View metrics in AWS CloudWatch console
3. Set up alarms for CPU, memory, disk usage

## Updating Infrastructure

After making changes to `.tf` files:

```bash
terraform plan
terraform apply
```

## Destroying Infrastructure

To tear down all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the EC2 instance and all Docker volumes. Make sure to backup your data before destroying!

## Troubleshooting

### Containers won't start

Check Docker service:
```bash
sudo systemctl status docker
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
docker-compose logs <service-name>
```

### Database connection issues

Check if containers are running:
```bash
docker-compose ps
```

View database logs:
```bash
docker-compose logs postgres
```

Access database container:
```bash
docker-compose exec postgres psql -U memesis_user -d memesis
```

### SSH connection refused

- Check security group allows your IP
- Verify key pair is correct
- Use Session Manager as alternative

## Support

For Terraform-specific issues, check:
- `terraform.tfstate` for current state
- AWS Console for actual resources
- CloudWatch Logs for application logs
