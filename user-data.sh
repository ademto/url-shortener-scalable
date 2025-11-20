#!/bin/bash
set -e

# Log output to file for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=========================================="
echo "Starting EC2 User Data Script"
echo "=========================================="

# Update system packages
echo "Updating system packages..."
yum update -y

# Install Node.js 24.x
echo "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_24.x | bash -
yum install -y nodejs

# Verify installation
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install Git
echo "Installing Git..."
yum install -y git

# Create application directory
APP_DIR="/home/ec2-user/url-shortener"
echo "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository from GitHub
echo "Cloning repository from GitHub..."
git clone https://github.com/ademto/url-shortener-scalable.git .

# If cloning fails, exit
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to clone repository"
    exit 1
fi

# Create .env file for the application
cat > /home/ec2-user/url-shortener/.env << EOF
NODE_ENV=production
PORT=3000
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=url-shortener-test
BASE_URL=https://ademto.me
EOF

# Install dependencies
echo "Installing npm dependencies..."
npm install --production

# Install PM2 globally for process management
echo "Installing PM2..."
npm install -g pm2

# Start application with PM2
echo "Starting application with PM2..."
pm2 start server.js --name url-shortener

# Configure PM2 to start on system boot
pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

# Set correct permissions
chown -R ec2-user:ec2-user /home/ec2-user/url-shortener

echo "=========================================="
echo "User Data Script Completed Successfully!"
echo "=========================================="
echo "Application should be running on port 3000"
echo "Check logs: pm2 logs url-shortener"
echo "Check status: pm2 status"
