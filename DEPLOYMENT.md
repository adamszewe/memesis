# Deployment Guide - EC2 with Docker Compose

This guide explains how to deploy Memesis to your EC2 instance using Docker Compose and ECR.

## Architecture Overview

The production deployment uses a multi-container architecture:

- **Frontend (nginx)**: Serves static React files and proxies API requests to backend
  - Port 80 (public)
  - Handles all user traffic
  - Proxies `/api/*` requests to backend

- **Backend (Go)**: API server
  - Port 8080 (internal only, not exposed)
  - Accessed only via frontend proxy

- **Database (PostgreSQL)**: Data storage
  - Port 5432 (internal only, not exposed)
  - Accessed only by backend

**Security**: Only the frontend (nginx) is exposed to the internet. The backend and database are only accessible within the Docker network.

## Prerequisites

✅ Your Terraform infrastructure is already set up and includes:
- EC2 instance with Docker & Docker Compose installed
- ECR repositories for backend and frontend images
- IAM role attached to EC2 with ECR read permissions
- Security groups configured

## Deployment Steps

### 1. Get Your EC2 Connection Details

From your local machine, get the SSH command:

```bash
cd terraform
terraform output ssh_command
```

### 2. Connect to Your EC2 Instance

```bash
# Example (use the actual command from terraform output):
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP
```

### 3. Set Up the Application Directory

```bash
# Navigate to the app directory (created by Terraform)
cd /opt/memesis

# Clone your repository
git clone https://github.com/YOUR_USERNAME/memesis.git .

# Or if already cloned, pull latest changes
git pull origin main
```

### 4. Authenticate Docker with ECR

The EC2 instance has an IAM role that allows pulling from ECR, but you need to log in to Docker:

```bash
# Get your AWS region and account ID from Terraform outputs
cd /opt/memesis/terraform
AWS_REGION=$(terraform output -raw ecr_repository_url | cut -d'.' -f4)
AWS_ACCOUNT_ID=$(terraform output -raw ecr_repository_url | cut -d'.' -f1)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

Or manually:

```bash
# For eu-west-1 region (adjust if different)
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 271882567315.dkr.ecr.eu-west-1.amazonaws.com
```

### 5. Configure Environment Variables

```bash
cd /opt/memesis

# Copy the production environment template
cp .env.prod.example .env

# Edit the .env file with your secure values
nano .env
```

**Important:** Change `DB_PASSWORD` to a secure password!

```env
DB_NAME=memesis
DB_USER=memesis_user
DB_PASSWORD=your_secure_password_here
DB_PORT=5432
APP_PORT=8080
```

### 6. Deploy the Application

**Option A: Using the deployment script (Recommended)**

```bash
# Make the script executable (first time only)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
- Authenticate with ECR
- Pull the latest image
- Stop existing containers
- Start services with health checks
- Display service status

**Option B: Manual deployment**

```bash
# Pull the latest backend image from ECR
docker compose -f docker-compose.prod.yml pull

# Start all services in detached mode
docker compose -f docker-compose.prod.yml up -d

# Check that services are running
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

**Note:** The backend service now includes health checks and will only start after the database is healthy.

### 7. Verify Deployment

Check that the application is running:

```bash
# Test the frontend health endpoint
curl http://localhost/health

# Should return: healthy

# Test the backend API via nginx proxy
curl http://localhost/api/ping

# Should return: {"message":"pong"}
```

From your local machine, test the public endpoint:

```bash
# Get the public URL
cd terraform
terraform output application_url

# Open in browser
http://YOUR_EC2_IP/

# Test API
curl http://YOUR_EC2_IP/api/ping
```

## Common Operations

### Update to Latest Version

When you push new code and GitHub Actions builds a new image:

**Option A: Using the deployment script (Recommended)**

```bash
cd /opt/memesis

# Pull latest code (for migrations, etc.)
git pull origin main

# Deploy latest version
./deploy.sh
```

**Option B: Manual update**

```bash
cd /opt/memesis

# Pull latest code (for migrations, etc.)
git pull origin main

# Re-authenticate with ECR (token expires after 12 hours)
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 271882567315.dkr.ecr.eu-west-1.amazonaws.com

# Pull latest Docker images
docker compose -f docker-compose.prod.yml pull

# Restart services
docker compose -f docker-compose.prod.yml up -d

# View logs to ensure everything started correctly
docker compose -f docker-compose.prod.yml logs -f backend
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Just backend
docker compose -f docker-compose.prod.yml logs -f backend

# Just database
docker compose -f docker-compose.prod.yml logs -f db
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart just the backend
docker compose -f docker-compose.prod.yml restart backend
```

### Stop Services

```bash
# Stop all services (keeps data)
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes database!)
docker compose -f docker-compose.prod.yml down -v
```

### Run Database Migrations

Migrations run automatically when the database container starts (from `/migrations` directory).

To run them manually:

```bash
# The migrations are copied into the backend container
# You can run them with the app or connect to the database directly

# Connect to the database
docker compose -f docker-compose.prod.yml exec db psql -U memesis_user -d memesis
```

### Seed the Database

```bash
# If you have a seed script, copy it to the container and run it
docker compose -f docker-compose.prod.yml exec backend /app seed
```

## Monitoring

### Check Container Health

```bash
# List running containers
docker ps

# Check resource usage
docker stats

# Inspect a specific container
docker inspect memesis-backend
```

### Database Backup

```bash
# Create a backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U memesis_user memesis > backup-$(date +%Y%m%d).sql

# Restore from backup
docker compose -f docker-compose.prod.yml exec -T db psql -U memesis_user memesis < backup-20231215.sql
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Check if ports are in use
sudo netstat -tulpn | grep 8080

# Restart Docker daemon
sudo systemctl restart docker
```

### Can't Pull from ECR

```bash
# Re-authenticate with ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 271882567315.dkr.ecr.eu-west-1.amazonaws.com

# Check IAM role permissions
aws sts get-caller-identity
```

### Database Connection Issues

```bash
# Check if database is running
docker compose -f docker-compose.prod.yml ps db

# Check database logs
docker compose -f docker-compose.prod.yml logs db

# Verify environment variables
docker compose -f docker-compose.prod.yml config
```

## Security Notes

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Use strong database passwords**
3. **Keep Docker and packages updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Monitor logs for suspicious activity**
5. **Consider setting up HTTPS** with nginx reverse proxy and Let's Encrypt

## Next Steps

- [ ] Set up automated deployments (webhook or cron job to pull latest images)
- [ ] Configure nginx reverse proxy for HTTPS
- [ ] Set up monitoring (CloudWatch, Prometheus, etc.)
- [ ] Configure automated backups
- [ ] Set up log aggregation
