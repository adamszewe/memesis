# Quick Deploy Guide - EC2

## First Time Setup

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_EC2_IP
   ```

2. **Clone the repository:**
   ```bash
   cd /opt/memesis
   git clone https://github.com/YOUR_USERNAME/memesis.git .
   ```

3. **Login to ECR:**
   ```bash
   aws ecr get-login-password --region eu-west-1 | \
     docker login --username AWS --password-stdin 271882567315.dkr.ecr.eu-west-1.amazonaws.com
   ```

4. **Configure environment:**
   ```bash
   cp .env.production.example .env
   nano .env  # Edit DB_PASSWORD and other settings
   ```

5. **Deploy:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

6. **Check it's working:**
   ```bash
   curl http://localhost:8080/ping
   # Should return: {"message":"pong"}
   ```

## Deploy Updates (After First Time)

### Option 1: Use the deployment script
```bash
cd /opt/memesis
./deploy.sh
```

### Option 2: Manual steps
```bash
cd /opt/memesis
git pull origin main
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f
```

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop everything
docker compose -f docker-compose.prod.yml down

# Check status
docker compose -f docker-compose.prod.yml ps
```

## Your Application URLs

- **Backend API:** http://YOUR_EC2_IP:8080
- **Health Check:** http://YOUR_EC2_IP:8080/ping
- **Posts Endpoint:** http://YOUR_EC2_IP:8080/api/posts?page=1

Replace `YOUR_EC2_IP` with your actual EC2 public IP (get it from `terraform output ec2_public_ip`).
